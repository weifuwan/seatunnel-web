package org.apache.seatunnel.admin.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

/**
 * Swagger configuration for generating REST API documentation.
 *
 * <p>
 * This configuration enables Swagger 2 for the Seatunnel Web project
 * and scans controller classes to expose API endpoints.
 * </p>
 */
@Configuration
@EnableSwagger2
public class SwaggerConfig {

    /**
     * Create a Swagger Docket bean to configure the API documentation.
     *
     * <p>
     * Scans the base package "org.apache.seatunnel.admin.controller"
     * and exposes all paths under Swagger UI.
     * </p>
     *
     * @return configured Docket instance
     */
    @Bean
    public Docket createRestApi() {
        return new Docket(DocumentationType.SWAGGER_2)
                .apiInfo(apiInfo()) // API metadata
                .select()
                .apis(RequestHandlerSelectors.basePackage("org.apache.seatunnel.admin.controller"))
                .paths(PathSelectors.any())
                .build()
                .enable(true); // Enable Swagger documentation
    }

    /**
     * Build API metadata information shown in Swagger UI.
     *
     * @return ApiInfo object containing title, description, contact, and version
     */
    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title("Seatunnel Web API Documentation")
                .description("Seatunnel Web REST APIs")
                .contact(new Contact("bruce", "", "295227940@qq.com"))
                .version("1.0.0")
                .build();
    }
}
