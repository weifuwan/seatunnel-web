# Introduction

The `seatunnel-web-bom` module is used to manage the version of third part dependencies. If you want to import
`seatunnel-web-xx` to your project, you need to import `seatunnel-web-bom` together by below way,
this can help you to manage the version.

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.apache.seatunnel-web</groupId>
            <artifactId>seatunnel-web-bom</artifactId>
            <version>${seatunnel-web.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

If you want to override the version defined in `seatunnel-web-bom` you can directly add the version at your
module's `dependencyManagement`.
