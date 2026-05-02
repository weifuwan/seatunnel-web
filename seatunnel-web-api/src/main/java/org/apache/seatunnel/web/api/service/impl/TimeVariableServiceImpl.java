package org.apache.seatunnel.web.api.service.impl;



import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.seatunnel.web.api.service.TimeVariableService;
import org.apache.seatunnel.web.common.enums.TimeVariableSource;
import org.apache.seatunnel.web.common.enums.TimeVariableValueType;
import org.apache.seatunnel.web.core.time.TimeExpressionEvaluator;
import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.dao.mapper.TimeVariableMapper;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePreviewReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableSaveReq;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariablePreviewVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableRenderVO;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import jakarta.annotation.Resource;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TimeVariableServiceImpl
        extends ServiceImpl<TimeVariableMapper, TimeVariable>
        implements TimeVariableService {

    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\$\\{([a-zA-Z][a-zA-Z0-9_]*)}");

    private static final String DEFAULT_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";

    @Resource
    private TimeExpressionEvaluator timeExpressionEvaluator;

    @Override
    public IPage<TimeVariableVO> page(TimeVariablePageReq req) {
        Page<TimeVariable> page = new Page<>(
                req.getPageNo() == null ? 1 : req.getPageNo(),
                req.getPageSize() == null ? 10 : req.getPageSize()
        );

        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.hasText(req.getKeyword())) {
            String keyword = req.getKeyword().trim();
            wrapper.and(w -> w
                    .like(TimeVariable::getParamName, keyword)
                    .or()
                    .like(TimeVariable::getParamDesc, keyword)
                    .or()
                    .like(TimeVariable::getExpression, keyword)
            );
        }

        if (StringUtils.hasText(req.getVariableSource())) {
            wrapper.eq(TimeVariable::getVariableSource, req.getVariableSource());
        }

        if (StringUtils.hasText(req.getValueType())) {
            wrapper.eq(TimeVariable::getValueType, req.getValueType());
        }

        if (req.getEnabled() != null) {
            wrapper.eq(TimeVariable::getEnabled, req.getEnabled());
        }

        wrapper.orderByDesc(TimeVariable::getVariableSource)
                .orderByDesc(TimeVariable::getCreateTime);

        IPage<TimeVariable> entityPage = this.page(page, wrapper);

        Page<TimeVariableVO> voPage = new Page<>();
        voPage.setCurrent(entityPage.getCurrent());
        voPage.setSize(entityPage.getSize());
        voPage.setTotal(entityPage.getTotal());

        List<TimeVariableVO> records = entityPage.getRecords()
                .stream()
                .map(this::toVO)
                .collect(Collectors.toList());

        voPage.setRecords(records);
        return voPage;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveOrUpdateVariable(TimeVariableSaveReq req) {
        validateSaveReq(req);

        TimeVariable entity;

        if (req.getId() == null) {
            entity = new TimeVariable();
            entity.setCreateTime(LocalDateTime.now());
        } else {
            entity = this.getById(req.getId());
            if (entity == null) {
                throw new IllegalArgumentException("时间变量不存在");
            }

            if (TimeVariableSource.SYSTEM.name().equals(entity.getVariableSource())) {
                throw new IllegalArgumentException("系统内置变量不允许修改");
            }
        }

        checkDuplicateName(req.getParamName(), req.getId());

        entity.setParamName(req.getParamName().trim());
        entity.setParamDesc(req.getParamDesc());
        entity.setVariableSource(
                StringUtils.hasText(req.getVariableSource())
                        ? req.getVariableSource()
                        : TimeVariableSource.CUSTOM.name()
        );
        entity.setValueType(req.getValueType());
        entity.setTimeFormat(req.getTimeFormat());
        entity.setDefaultValue(req.getDefaultValue());
        entity.setExpression(req.getExpression());
        entity.setExampleValue(req.getExampleValue());
        entity.setEnabled(req.getEnabled() == null || req.getEnabled());
        entity.setRemark(req.getRemark());
        entity.setUpdateTime(LocalDateTime.now());

        this.saveOrUpdate(entity);
        return entity.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteVariable(Long id) {
        TimeVariable entity = this.getById(id);
        if (entity == null) {
            return;
        }

        if (TimeVariableSource.SYSTEM.name().equals(entity.getVariableSource())) {
            throw new IllegalArgumentException("系统内置变量不允许删除");
        }

        this.removeById(id);
    }

    @Override
    public TimeVariablePreviewVO preview(TimeVariablePreviewReq req) {
        if (!StringUtils.hasText(req.getExpression())) {
            throw new IllegalArgumentException("表达式不能为空");
        }

        String timeFormat = StringUtils.hasText(req.getTimeFormat())
                ? req.getTimeFormat()
                : DEFAULT_TIME_FORMAT;

        LocalDateTime baseTime = parseBaseTime(req.getBaseTime());

        String value = timeExpressionEvaluator.evaluateToString(
                req.getExpression(),
                timeFormat,
                baseTime
        );

        String baseTimeText = baseTime.format(DateTimeFormatter.ofPattern(DEFAULT_TIME_FORMAT));

        return new TimeVariablePreviewVO(
                req.getExpression(),
                timeFormat,
                baseTimeText,
                value
        );
    }

    @Override
    public TimeVariableRenderVO render(TimeVariableRenderReq req) {
        if (!StringUtils.hasText(req.getContent())) {
            throw new IllegalArgumentException("待渲染内容不能为空");
        }

        LocalDateTime baseTime = parseBaseTime(req.getBaseTime());
        Map<String, String> overrideVariables = req.getOverrideVariables() == null
                ? Collections.emptyMap()
                : req.getOverrideVariables();

        Map<String, TimeVariable> variableMap = listEnabledVariables()
                .stream()
                .collect(Collectors.toMap(TimeVariable::getParamName, item -> item, (a, b) -> a));

        String content = req.getContent();
        Matcher matcher = VARIABLE_PATTERN.matcher(content);

        StringBuffer renderedBuffer = new StringBuffer();
        TimeVariableRenderVO vo = new TimeVariableRenderVO();
        vo.setOriginalContent(content);

        Set<String> resolvedNames = new LinkedHashSet<>();
        Set<String> unresolvedNames = new LinkedHashSet<>();

        while (matcher.find()) {
            String variableName = matcher.group(1);

            String value;
            TimeVariable variable = variableMap.get(variableName);

            if (overrideVariables.containsKey(variableName)) {
                value = overrideVariables.get(variableName);

                TimeVariableRenderVO.VariableItem item = new TimeVariableRenderVO.VariableItem();
                item.setName(variableName);
                item.setValue(value);
                item.setSource("OVERRIDE");
                item.setExpression(null);
                item.setTimeFormat(null);
                vo.getVariables().add(item);

                resolvedNames.add(variableName);
                matcher.appendReplacement(renderedBuffer, Matcher.quoteReplacement(value));
                continue;
            }

            if (variable == null) {
                unresolvedNames.add(variableName);
                matcher.appendReplacement(renderedBuffer, Matcher.quoteReplacement(matcher.group(0)));
                continue;
            }

            value = resolveVariableValue(variable, baseTime);

            TimeVariableRenderVO.VariableItem item = new TimeVariableRenderVO.VariableItem();
            item.setName(variableName);
            item.setValue(value);
            item.setSource(variable.getVariableSource());
            item.setExpression(variable.getExpression());
            item.setTimeFormat(variable.getTimeFormat());
            vo.getVariables().add(item);

            resolvedNames.add(variableName);
            matcher.appendReplacement(renderedBuffer, Matcher.quoteReplacement(value));
        }

        matcher.appendTail(renderedBuffer);

        vo.setRenderedContent(renderedBuffer.toString());
        vo.setUnresolvedVariables(new ArrayList<>(unresolvedNames));

        return vo;
    }

    private String resolveVariableValue(TimeVariable variable, LocalDateTime baseTime) {
        if (TimeVariableValueType.FIXED.name().equals(variable.getValueType())) {
            if (!StringUtils.hasText(variable.getDefaultValue())) {
                throw new IllegalArgumentException("固定值变量未配置默认值：" + variable.getParamName());
            }
            return variable.getDefaultValue();
        }

        if (TimeVariableValueType.DYNAMIC.name().equals(variable.getValueType())) {
            if (!StringUtils.hasText(variable.getExpression())) {
                throw new IllegalArgumentException("动态变量未配置表达式：" + variable.getParamName());
            }

            String timeFormat = StringUtils.hasText(variable.getTimeFormat())
                    ? variable.getTimeFormat()
                    : DEFAULT_TIME_FORMAT;

            return timeExpressionEvaluator.evaluateToString(
                    variable.getExpression(),
                    timeFormat,
                    baseTime
            );
        }

        throw new IllegalArgumentException("不支持的变量取值方式：" + variable.getValueType());
    }

    private List<TimeVariable> listEnabledVariables() {
        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TimeVariable::getEnabled, true);
        return this.list(wrapper);
    }

    private void validateSaveReq(TimeVariableSaveReq req) {
        if (req == null) {
            throw new IllegalArgumentException("请求参数不能为空");
        }

        if (!StringUtils.hasText(req.getParamName())) {
            throw new IllegalArgumentException("参数名称不能为空");
        }

        if (!req.getParamName().matches("^[a-zA-Z][a-zA-Z0-9_]*$")) {
            throw new IllegalArgumentException("参数名称只能包含字母、数字、下划线，并且必须以字母开头");
        }

        if (!StringUtils.hasText(req.getParamDesc())) {
            throw new IllegalArgumentException("参数说明不能为空");
        }

        if (!StringUtils.hasText(req.getValueType())) {
            throw new IllegalArgumentException("取值方式不能为空");
        }

        if (!TimeVariableValueType.FIXED.name().equals(req.getValueType())
                && !TimeVariableValueType.DYNAMIC.name().equals(req.getValueType())) {
            throw new IllegalArgumentException("取值方式只支持 FIXED / DYNAMIC");
        }

        if (TimeVariableValueType.FIXED.name().equals(req.getValueType())) {
            if (!StringUtils.hasText(req.getDefaultValue())) {
                throw new IllegalArgumentException("固定值变量必须填写默认值");
            }
        }

        if (TimeVariableValueType.DYNAMIC.name().equals(req.getValueType())) {
            if (!StringUtils.hasText(req.getExpression())) {
                throw new IllegalArgumentException("动态变量必须填写表达式");
            }
            if (!StringUtils.hasText(req.getTimeFormat())) {
                throw new IllegalArgumentException("动态变量必须填写时间格式");
            }

            // 提前校验表达式是否能解析
            timeExpressionEvaluator.evaluate(req.getExpression(), LocalDateTime.now());
        }
    }

    private void checkDuplicateName(String paramName, Long id) {
        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TimeVariable::getParamName, paramName.trim());

        if (id != null) {
            wrapper.ne(TimeVariable::getId, id);
        }

        long count = this.count(wrapper);
        if (count > 0) {
            throw new IllegalArgumentException("变量名称已存在：" + paramName);
        }
    }

    private LocalDateTime parseBaseTime(String baseTime) {
        if (!StringUtils.hasText(baseTime)) {
            return LocalDateTime.now();
        }

        String text = baseTime.trim();

        List<DateTimeFormatter> formatters = Arrays.asList(
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
                DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),
                DateTimeFormatter.ISO_LOCAL_DATE_TIME
        );

        for (DateTimeFormatter formatter : formatters) {
            try {
                return LocalDateTime.parse(text, formatter);
            } catch (Exception ignored) {
            }
        }

        throw new IllegalArgumentException("基准时间格式不正确，请使用 yyyy-MM-dd HH:mm:ss");
    }

    private TimeVariableVO toVO(TimeVariable entity) {
        TimeVariableVO vo = new TimeVariableVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
