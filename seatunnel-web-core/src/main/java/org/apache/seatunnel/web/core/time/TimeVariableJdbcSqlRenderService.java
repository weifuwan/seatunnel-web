package org.apache.seatunnel.web.core.time;

import jakarta.annotation.Resource;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.plugin.datasource.api.hocon.DataSourceHoconBuilder;
import org.apache.seatunnel.web.core.exceptions.ServiceException;
import org.apache.seatunnel.web.spi.bean.dto.TimeVariableRenderReq;
import org.apache.seatunnel.web.spi.bean.vo.TimeVariableRenderVO;
import org.apache.seatunnel.web.spi.enums.Status;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TimeVariableJdbcSqlRenderService {

    private static final Pattern VARIABLE_PATTERN =
            Pattern.compile("\\$\\{(?:var:)?([a-zA-Z][a-zA-Z0-9_]*)}");

    @Resource
    private TimeVariableRenderService timeVariableRenderService;

    public String renderSql(String sql, DataSourceHoconBuilder hoconBuilder) {
        if (StringUtils.isBlank(sql)) {
            return sql;
        }

        TimeVariableRenderReq req = new TimeVariableRenderReq();
        req.setContent(sql);

        TimeVariableRenderVO vo = timeVariableRenderService.render(req);

        if (vo.getUnresolvedVariables() != null && !vo.getUnresolvedVariables().isEmpty()) {
            throw new ServiceException(
                    Status.REQUEST_PARAMS_NOT_VALID_ERROR,
                    "存在未解析的时间变量：" + vo.getUnresolvedVariables()
            );
        }

        Map<String, TimeVariableRenderVO.VariableItem> variableItemMap =
                vo.getVariables()
                        .stream()
                        .collect(Collectors.toMap(
                                TimeVariableRenderVO.VariableItem::getName,
                                item -> item,
                                (first, second) -> first
                        ));

        Matcher matcher = VARIABLE_PATTERN.matcher(sql);
        StringBuffer buffer = new StringBuffer();

        while (matcher.find()) {
            String variableName = matcher.group(1);
            TimeVariableRenderVO.VariableItem item = variableItemMap.get(variableName);

            if (item == null) {
                matcher.appendReplacement(buffer, Matcher.quoteReplacement(matcher.group(0)));
                continue;
            }

            String sqlLiteral = hoconBuilder.renderTimeLiteral(
                    item.getValue(),
                    item.getTimeFormat()
            );

            matcher.appendReplacement(buffer, Matcher.quoteReplacement(sqlLiteral));
        }

        matcher.appendTail(buffer);
        return buffer.toString();
    }
}