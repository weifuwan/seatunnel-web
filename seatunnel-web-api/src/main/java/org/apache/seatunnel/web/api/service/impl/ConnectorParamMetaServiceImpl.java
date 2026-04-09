package org.apache.seatunnel.web.api.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.RequiredArgsConstructor;
import org.apache.seatunnel.web.api.service.ConnectorParamMetaService;
import org.apache.seatunnel.web.dao.entity.ConnectorParamMetaEntity;
import org.apache.seatunnel.web.dao.mapper.ConnectorParamMetaMapper;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaCreateDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaQueryDTO;
import org.apache.seatunnel.web.spi.bean.dto.ConnectorParamMetaUpdateDTO;
import org.apache.seatunnel.web.spi.bean.vo.ConnectorParamMetaVO;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConnectorParamMetaServiceImpl
        extends ServiceImpl<ConnectorParamMetaMapper, ConnectorParamMetaEntity>
        implements ConnectorParamMetaService {

    private final ConnectorParamMetaMapper connectorParamMetaMapper;

    @Override
    public Long create(ConnectorParamMetaCreateDTO dto) {
        checkDuplicate(dto.getType(), dto.getConnectorName(), dto.getParamName(), null);

        ConnectorParamMetaEntity entity = new ConnectorParamMetaEntity();
        BeanUtils.copyProperties(dto, entity);

        connectorParamMetaMapper.insert(entity);
        return entity.getId();
    }

    @Override
    public boolean updateById(ConnectorParamMetaUpdateDTO dto) {
        ConnectorParamMetaEntity existing = connectorParamMetaMapper.selectById(dto.getId());
        if (existing == null) {
            throw new IllegalArgumentException("参数记录不存在，id=" + dto.getId());
        }

        String targetType = StringUtils.hasText(dto.getType()) ? dto.getType() : existing.getType();
        String targetConnectorName = StringUtils.hasText(dto.getConnectorName()) ? dto.getConnectorName() : existing.getConnectorName();
        String targetParamName = StringUtils.hasText(dto.getParamName()) ? dto.getParamName() : existing.getParamName();

        checkDuplicate(targetType, targetConnectorName, targetParamName, dto.getId());

        ConnectorParamMetaEntity entity = new ConnectorParamMetaEntity();
        BeanUtils.copyProperties(dto, entity);

        return connectorParamMetaMapper.updateById(entity) > 0;
    }

    @Override
    public ConnectorParamMetaVO getById(Long id) {
        ConnectorParamMetaEntity entity = connectorParamMetaMapper.selectById(id);
        if (entity == null) {
            return null;
        }
        return toVO(entity);
    }

    @Override
    public IPage<ConnectorParamMetaVO> pageQuery(ConnectorParamMetaQueryDTO dto) {
        Page<ConnectorParamMetaEntity> page = new Page<>(dto.getPageNum(), dto.getPageSize());

        LambdaQueryWrapper<ConnectorParamMetaEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(dto.getType()), ConnectorParamMetaEntity::getType, dto.getType())
                .eq(StringUtils.hasText(dto.getConnectorName()), ConnectorParamMetaEntity::getConnectorName, dto.getConnectorName())
                .like(StringUtils.hasText(dto.getParamName()), ConnectorParamMetaEntity::getParamName, dto.getParamName())
                .orderByDesc(ConnectorParamMetaEntity::getUpdateTime)
                .orderByDesc(ConnectorParamMetaEntity::getId);

        IPage<ConnectorParamMetaEntity> entityPage = connectorParamMetaMapper.selectPage(page, wrapper);

        Page<ConnectorParamMetaVO> voPage = new Page<>(entityPage.getCurrent(), entityPage.getSize(), entityPage.getTotal());
        voPage.setRecords(entityPage.getRecords().stream().map(this::toVO).collect(Collectors.toList()));
        return voPage;
    }

    @Override
    public List<ConnectorParamMetaVO> listByConnectorName(String connectorName, String type) {
        LambdaQueryWrapper<ConnectorParamMetaEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(connectorName), ConnectorParamMetaEntity::getConnectorName, connectorName)
                .eq(StringUtils.hasText(type), ConnectorParamMetaEntity::getType, type)
                .orderByAsc(ConnectorParamMetaEntity::getParamName);

        return connectorParamMetaMapper.selectList(wrapper)
                .stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean deleteById(Long id) {
        return connectorParamMetaMapper.deleteById(id) > 0;
    }

    private void checkDuplicate(String type, String connectorName, String paramName, Long excludeId) {
        LambdaQueryWrapper<ConnectorParamMetaEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ConnectorParamMetaEntity::getType, type)
                .eq(ConnectorParamMetaEntity::getConnectorName, connectorName)
                .eq(ConnectorParamMetaEntity::getParamName, paramName);

        List<ConnectorParamMetaEntity> exists = connectorParamMetaMapper.selectList(wrapper);
        boolean duplicated = exists.stream()
                .anyMatch(item -> !Objects.equals(item.getId(), excludeId));

        if (duplicated) {
            throw new IllegalArgumentException(
                    String.format("参数已存在：type=%s, connectorName=%s, paramName=%s", type, connectorName, paramName)
            );
        }
    }

    private ConnectorParamMetaVO toVO(ConnectorParamMetaEntity entity) {
        ConnectorParamMetaVO vo = new ConnectorParamMetaVO();
        BeanUtils.copyProperties(entity, vo);
        return vo;
    }
}
