package org.apache.seatunnel.web.dao.repository.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import jakarta.annotation.Resource;
import lombok.NonNull;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.common.bean.dto.DataSourceDTO;
import org.apache.seatunnel.web.common.enums.ConnStatus;
import org.apache.seatunnel.web.dao.entity.DataSource;
import org.apache.seatunnel.web.dao.mapper.DataSourceMapper;
import org.apache.seatunnel.web.dao.repository.BaseDao;
import org.apache.seatunnel.web.dao.repository.DataSourceDao;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class DataSourceDaoImpl extends BaseDao<DataSource, DataSourceMapper> implements DataSourceDao {

    @Resource
    private DataSourceMapper dataSourceMapper;

    public DataSourceDaoImpl(@NonNull DataSourceMapper sessionMapper) {
        super(sessionMapper);
    }

    @Override
    public boolean checkName(String name) {
        LambdaQueryWrapper<DataSource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataSource::getName, name.trim());
        return dataSourceMapper.selectCount(wrapper) > 0;
    }

    @Override
    public boolean checkNameExcludeId(String name, Long id) {
        LambdaQueryWrapper<DataSource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DataSource::getName, name.trim())
                .ne(id != null, DataSource::getId, id);
        return dataSourceMapper.selectCount(wrapper) > 0;
    }

    @Override
    public IPage<DataSource> queryPage(DataSourceDTO dto) {
        LambdaQueryWrapper<DataSource> wrapper = new LambdaQueryWrapper<DataSource>()
                .eq(StringUtils.isNotBlank(dto.getName()), DataSource::getName, dto.getName())
                .eq(dto.getDbType() != null, DataSource::getDbType, dto.getDbType())
                .eq(dto.getEnvironment() != null, DataSource::getEnvironment, dto.getEnvironment())
                .orderByDesc(DataSource::getCreateTime);

        IPage<DataSource> page = new Page<>(dto.getPageNo(), dto.getPageSize());
        return dataSourceMapper.selectPage(page, wrapper);
    }

    @Override
    public List<DataSource> queryByDbType(String dbType) {
        LambdaQueryWrapper<DataSource> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.isNotBlank(dbType), DataSource::getDbType, dbType);
        return dataSourceMapper.selectList(wrapper);
    }

    @Override
    public int updateConnStatus(Long id, ConnStatus status) {
        DataSource entity = new DataSource();
        entity.setId(id);
        entity.setConnStatus(status);
        return dataSourceMapper.updateById(entity);
    }
}
