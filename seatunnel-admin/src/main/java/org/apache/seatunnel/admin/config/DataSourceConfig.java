package org.apache.seatunnel.admin.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.config.GlobalConfig;
import com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler;
import com.baomidou.mybatisplus.extension.plugins.PaginationInterceptor;
import com.baomidou.mybatisplus.extension.spring.MybatisSqlSessionFactoryBean;
import org.apache.ibatis.logging.stdout.StdOutImpl;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.type.JdbcType;
import org.mybatis.spring.SqlSessionTemplate;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;

import javax.sql.DataSource;

/**
 * Spring configuration for DataSource, MyBatis, and MyBatis-Plus integration.
 *
 * <p>
 * This configuration sets up:
 * </p>
 * <ul>
 *     <li>Primary DataSource using Spring Boot configuration properties</li>
 *     <li>Global MyBatis-Plus configuration</li>
 *     <li>SqlSessionFactory with mapper XML scanning and MyBatis configuration</li>
 *     <li>Transaction management</li>
 *     <li>SqlSessionTemplate for MyBatis usage</li>
 *     <li>Pagination interceptor for MySQL</li>
 * </ul>
 */
@Configuration
@MapperScan("org.apache.seatunnel.admin.dao") // Scan DAO interfaces for MyBatis
public class DataSourceConfig {

    /**
     * Primary DataSource bean configured via properties prefixed with "spring.datasource.cockpit".
     *
     * @return DataSource instance
     */
    @Bean(name = "dataSource")
    @ConfigurationProperties(prefix = "spring.datasource.cockpit")
    @Primary
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    /**
     * Global MyBatis-Plus configuration.
     *
     * <p>
     * Configures automatic ID generation strategy and disables the banner.
     * </p>
     *
     * @return GlobalConfig instance
     */
    @Bean(name = "cockpitGlobalConfig")
    public GlobalConfig globalConfig() {
        GlobalConfig globalConfig = new GlobalConfig();
        globalConfig.setBanner(false); // Disable MyBatis-Plus startup banner
        GlobalConfig.DbConfig dbConfig = new GlobalConfig.DbConfig();
        dbConfig.setIdType(IdType.AUTO); // Use auto-increment primary keys
        globalConfig.setDbConfig(dbConfig);
        return globalConfig;
    }

    /**
     * Primary SqlSessionFactory configured with:
     * <ul>
     *     <li>DataSource</li>
     *     <li>Mapper XML locations</li>
     *     <li>MyBatis configuration options (camel-case mapping, logging, enum handler, etc.)</li>
     *     <li>Pagination interceptor plugin</li>
     * </ul>
     *
     * @param dataSource injected DataSource
     * @return SqlSessionFactory instance
     * @throws Exception if bean creation fails
     */
    @Bean(name = "sqlSessionFactory")
    @Primary
    public SqlSessionFactory sqlSessionFactory(@Qualifier("dataSource") DataSource dataSource) throws Exception {
        MybatisSqlSessionFactoryBean bean = new MybatisSqlSessionFactoryBean();
        bean.setDataSource(dataSource);
        bean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath*:mapper/*.xml"));
        bean.setGlobalConfig(globalConfig());

        // MyBatis core configuration
        MybatisConfiguration configuration = new MybatisConfiguration();
        configuration.setJdbcTypeForNull(JdbcType.NULL); // Handle null JDBC types
        configuration.setMapUnderscoreToCamelCase(true); // Convert snake_case to camelCase
        configuration.setCacheEnabled(false); // Disable MyBatis second-level cache
        configuration.setLogImpl(StdOutImpl.class); // Enable logging to stdout
        configuration.setDefaultEnumTypeHandler(MybatisEnumTypeHandler.class); // Enum handler
        bean.setConfiguration(configuration);

        // Add pagination interceptor
        bean.setPlugins(paginationInterceptor());
        return bean.getObject();
    }

    /**
     * Configure transaction manager for the primary DataSource.
     *
     * @param dataSource injected DataSource
     * @return DataSourceTransactionManager instance
     */
    @Bean(name = "transactionManager")
    @Primary
    public DataSourceTransactionManager transactionManager(@Qualifier("dataSource") DataSource dataSource) {
        return new DataSourceTransactionManager(dataSource);
    }

    /**
     * Primary SqlSessionTemplate for MyBatis operations.
     *
     * @param sqlSessionFactory injected SqlSessionFactory
     * @return SqlSessionTemplate instance
     */
    @Bean(name = "sqlSession")
    @Primary
    public SqlSessionTemplate sqlSessionTemplate(@Qualifier("sqlSessionFactory") SqlSessionFactory sqlSessionFactory) {
        return new SqlSessionTemplate(sqlSessionFactory);
    }

    /**
     * Pagination interceptor for MySQL, required for MyBatis-Plus pagination support.
     *
     * @return PaginationInterceptor instance
     */
    @Bean
    public PaginationInterceptor paginationInterceptor() {
        PaginationInterceptor page = new PaginationInterceptor();
        page.setDbType(DbType.MYSQL);
        return page;
    }
}
