
import type { FormInstance } from "antd";
import { Button, Input, message, Space, Upload } from "antd";
import { uploadDriverJar } from "../services/pluginConfig";

export default function DriverLocationField(props: {
  field: any;
  dbType: string;
  configForm: FormInstance;
}) {
  const { field, dbType, configForm } = props;

  return (
    <Space.Compact style={{ width: "100%" }}>
      <Input
        size="small"
        placeholder={field.placeholder}
        value={configForm.getFieldValue(field.key)}
        onChange={(e) => {
          const v = e.target.value;
          configForm.setFieldValue(field.key, v);
          setTimeout(
            () => configForm.validateFields([field.key]).catch(() => {}),
            0
          );
        }}
      />

      <Upload
        accept=".jar"
        showUploadList={false}
        beforeUpload={(file) => {
          const isJar = file.name.toLowerCase().endsWith(".jar");
          if (!isJar) {
            message.error("只允许上传 .jar 文件");
            return Upload.LIST_IGNORE;
          }

          const maxMB = 200;
          const okSize = file.size / 1024 / 1024 <= maxMB;
          if (!okSize) {
            message.error(`文件不能超过 ${maxMB}MB`);
            return Upload.LIST_IGNORE;
          }

          return true;
        }}
        customRequest={async (options: any) => {
          const { file, onSuccess, onError } = options;
          try {
            const data = await uploadDriverJar(dbType, file as File);

            console.log(data);

            const jarValue =
              typeof data === "string"
                ? data
                : data?.fileName || data?.path || "";
            console.log(jarValue);
            if (!jarValue) throw new Error("上传成功但未返回 jar 信息");

            configForm.setFieldValue("driverLocation", jarValue);
            configForm.validateFields(["driverLocation"]).catch(() => {});
            message.success("驱动包上传成功");
            console.log(jarValue);
            onSuccess?.(data as any);
          } catch (e: any) {
            message.error(e?.message || "驱动包上传失败");
            onError?.(e);
          }
        }}
      >
        <Button size="small" type="default">
          上传
        </Button>
      </Upload>
    </Space.Compact>
  );
}
