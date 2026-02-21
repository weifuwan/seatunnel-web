package org.apache.seatunnel.admin.service.impl;

import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.admin.dao.SeatunnelStreamJobDefinitionMapper;
import org.apache.seatunnel.admin.service.SeatunnelJobInstanceService;
import org.apache.seatunnel.admin.service.SeatunnelStreamJobDefinitionService;
import org.apache.seatunnel.communal.bean.dto.SeatunnelStreamJobDefinitionDTO;
import org.apache.seatunnel.communal.bean.entity.PaginationResult;
import org.apache.seatunnel.communal.bean.po.SeatunnelStreamJobDefinitionPO;
import org.apache.seatunnel.communal.bean.vo.SeatunnelStreamJobDefinitionVO;
import org.apache.seatunnel.communal.utils.CodeGenerateUtils;
import org.apache.seatunnel.communal.utils.ConvertUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class SeatunnelStreamJobDefinitionServiceImpl
        extends ServiceImpl<SeatunnelStreamJobDefinitionMapper, SeatunnelStreamJobDefinitionPO>
        implements SeatunnelStreamJobDefinitionService {

    @Resource
    private SeatunnelJobInstanceService seatunnelJobInstanceService;


    @Override
    public Long create(SeatunnelStreamJobDefinitionDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Job definition DTO cannot be null");
        }

        SeatunnelStreamJobDefinitionPO po = ConvertUtil.sourceToTarget(dto, SeatunnelStreamJobDefinitionPO.class);
        long id = CodeGenerateUtils.getInstance().genCode();
        po.setId(id);
        po.setJobVersion(1);

        Instant now = Instant.now();
        po.setCreateTime(Date.from(now));
        po.setUpdateTime(Date.from(now));
        String jobInfo = dto.getJobDefinitionInfo();
        setWholeSyncTables(po, jobInfo);
        save(po);
        return id;
    }


    @Override
    public Long update(Long id, SeatunnelStreamJobDefinitionDTO dto) {
        if (id == null || dto == null) {
            throw new IllegalArgumentException("Job definition ID or DTO cannot be null");
        }

        SeatunnelStreamJobDefinitionPO existingPO = getById(id);
        if (existingPO == null) {
            throw new RuntimeException("Job definition not found for ID: " + id);
        }

        SeatunnelStreamJobDefinitionPO po = ConvertUtil.sourceToTarget(dto, SeatunnelStreamJobDefinitionPO.class);
        po.setId(id);
        po.setJobVersion(existingPO.getJobVersion() + 1);
        po.setCreateTime(existingPO.getCreateTime());
        po.setUpdateTime(new Date());

        boolean success = updateById(po);
        if (!success) {
            throw new RuntimeException("Failed to update job definition ID: " + id);
        }

        return id;
    }


    @Override
    public SeatunnelStreamJobDefinitionVO selectById(Long id) {
        if (id == null) return null;
        SeatunnelStreamJobDefinitionPO po = getById(id);
        return po == null ? null : ConvertUtil.sourceToTarget(po, SeatunnelStreamJobDefinitionVO.class);
    }


    @Override
    public PaginationResult<SeatunnelStreamJobDefinitionVO> paging(SeatunnelStreamJobDefinitionDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Job definition DTO cannot be null");
        }

        LambdaQueryWrapper<SeatunnelStreamJobDefinitionPO> wrapper = buildWrapper(dto);
        IPage<SeatunnelStreamJobDefinitionPO> pageRequest = new Page<>(dto.getPageNo(), dto.getPageSize());
        IPage<SeatunnelStreamJobDefinitionPO> pageResult = page(pageRequest, wrapper);

        List<SeatunnelStreamJobDefinitionVO> records = ConvertUtil.sourceListToTarget(pageResult.getRecords(), SeatunnelStreamJobDefinitionVO.class);
        return PaginationResult.buildSuc(records, pageResult);
    }


    private LambdaQueryWrapper<SeatunnelStreamJobDefinitionPO> buildWrapper(SeatunnelStreamJobDefinitionDTO dto) {
        LambdaQueryWrapper<SeatunnelStreamJobDefinitionPO> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(dto.getJobName())) {
            wrapper.eq(SeatunnelStreamJobDefinitionPO::getJobName, dto.getJobName());
        }
        return wrapper;
    }


    @Override
    public Boolean delete(String id) {
        if (StringUtils.isBlank(id)) {
            throw new IllegalArgumentException("Job definition ID cannot be empty");
        }
        return removeById(id);
    }


    @Override
    public String buildHoconConfig(SeatunnelStreamJobDefinitionDTO dto) {
        if (dto == null || dto.getJobDefinitionInfo() == null) {
            throw new IllegalArgumentException("Job definition info cannot be null");
        }
        return seatunnelJobInstanceService.buildHoconConfigWithStream(dto);
    }

    /**
     * Sets the source and sink types and tables for a Seatunnel job in the PO object,
     * specifically for whole-table synchronization jobs.
     *
     * @param po      SeatunnelJobDefinitionPO object to be updated with job info
     * @param jobInfo JSON string representing the job definition, expected to contain
     *                "source", "target", and "tableMatch" objects.
     * @throws IllegalArgumentException if the jobInfo JSON is invalid or missing required fields.
     */
    private void setWholeSyncTables(SeatunnelStreamJobDefinitionPO po, String jobInfo) {
        try {
            JSONObject jobJson = JSONObject.parseObject(jobInfo);
            JSONObject source = jobJson.getJSONObject("source");
            JSONObject target = jobJson.getJSONObject("target");
            JSONObject tableMatch = jobJson.getJSONObject("tableMatch");

            po.setSourceType(source.getString("dbType"));
            po.setSinkType(target.getString("dbType"));

            JSONArray tables = tableMatch.getJSONArray("tables");
            List<String> tableList = new ArrayList<>();
            for (int i = 0; i < tables.size(); i++) {
                tableList.add(tables.getString(i));
            }
            String tablesStr = String.join(",", tableList);
            po.setSourceTable(tablesStr);
            po.setSinkTable(tablesStr);
        } catch (JSONException e) {
            throw new IllegalArgumentException("Invalid job definition info for wholeSync: " + e.getMessage(), e);
        }
    }


}
