package org.apache.seatunnel.web.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.dao.entity.TimeVariable;
import org.apache.seatunnel.web.dao.mapper.TimeVariableMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.TimeVariableDao;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariablePageReq;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TimeVariableDaoImpl
        extends BaseDao<TimeVariable, TimeVariableMapper>
        implements TimeVariableDao {

    @Resource
    private TimeVariableMapper timeVariableMapper;

    public TimeVariableDaoImpl(@NonNull TimeVariableMapper timeVariableMapper) {
        super(timeVariableMapper);
    }

    @Override
    public boolean checkDuplicate(String paramName) {
        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TimeVariable::getParamName, paramName);
        return timeVariableMapper.selectCount(wrapper) > 0;
    }

    @Override
    public boolean checkDuplicateExcludeId(String paramName, Long id) {
        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TimeVariable::getParamName, paramName)
                .ne(id != null, TimeVariable::getId, id);
        return timeVariableMapper.selectCount(wrapper) > 0;
    }

    @Override
    public IPage<TimeVariable> queryPage(TimeVariablePageReq req) {
        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();

        if (StringUtils.isNotBlank(req.getKeyword())) {
            String keyword = req.getKeyword().trim();
            wrapper.and(w -> w
                    .like(TimeVariable::getParamName, keyword)
                    .or()
                    .like(TimeVariable::getParamDesc, keyword)
                    .or()
                    .like(TimeVariable::getExpression, keyword)
                    .or()
                    .like(TimeVariable::getDefaultValue, keyword)
                    .or()
                    .like(TimeVariable::getExampleValue, keyword)
            );
        }

        wrapper.eq(StringUtils.isNotBlank(req.getVariableSource()),
                TimeVariable::getVariableSource,
                req.getVariableSource())
                .eq(StringUtils.isNotBlank(req.getValueType()),
                        TimeVariable::getValueType,
                        req.getValueType())
                .eq(req.getEnabled() != null,
                        TimeVariable::getEnabled,
                        req.getEnabled())
                .orderByAsc(TimeVariable::getVariableSource)
                .orderByDesc(TimeVariable::getUpdateTime)
                .orderByDesc(TimeVariable::getId);

        IPage<TimeVariable> page = new Page<>(
                req.getPageNo() == null ? 1 : req.getPageNo(),
                req.getPageSize() == null ? 10 : req.getPageSize()
        );

        return timeVariableMapper.selectPage(page, wrapper);
    }

    @Override
    public List<TimeVariable> queryEnabledList() {
        LambdaQueryWrapper<TimeVariable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TimeVariable::getEnabled, true)
                .orderByAsc(TimeVariable::getVariableSource)
                .orderByAsc(TimeVariable::getParamName)
                .orderByAsc(TimeVariable::getId);

        return timeVariableMapper.selectList(wrapper);
    }
}