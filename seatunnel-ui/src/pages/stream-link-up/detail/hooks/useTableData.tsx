import { dataSourceCatalogApi } from "@/pages/data-source/type";
import { TableOutlined } from "@ant-design/icons";
import { message } from "antd";
import { debounce } from "lodash";
import { useCallback, useState } from "react";
import { TableItem } from "../types";

export const useTableData = () => {
  const [data, setData] = useState<TableItem[]>([]);
  const [multiTableList, setMultiTableList] = useState<string[]>([]);
  const [readOnlyTables, setReadOnlyTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableKeyword, setTableKeyword] = useState("");

  const fetchTables = async (
    dataSourceId: string,
    currentMatchMode?: string,
    radioChange: boolean = false
  ) => {
    try {
      setLoading(true);
      const res = await dataSourceCatalogApi.listTable(dataSourceId);
      if (res?.code === 0) {
        const tmp: TableItem[] = res.data.map((item: any) => ({
          key: item.value,
          value: item.label,
          title: (
            <div>
              <TableOutlined style={{ color: "orange" }} /> &nbsp;&nbsp;
              {item.label}
            </div>
          ),
        }));

        if (currentMatchMode === "4") {
          setData(tmp);
          setMultiTableList(tmp.map((t) => t.key));
        } else if (currentMatchMode === "1") {
          setData(tmp);
          if (radioChange === true) {
            setMultiTableList([]);
          }
        } else {
          setData(tmp);
        }
      } else {
        message.error(res?.message || "Failed to fetch tables");
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch tables");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceTables = async (
    dataSourceId: string,
    matchMode: string,
    keyword?: string
  ) => {
    try {
      setLoading(true);
      const res = await dataSourceCatalogApi.listTableReference(
        dataSourceId,
        matchMode,
        keyword
      );
      if (res?.code === 0) {
        const tmp: TableItem[] = res.data.map((item: any) => ({
          key: item.value,
          value: item.label,
          title: (
            <div>
              <TableOutlined style={{ color: "orange" }} />
              &nbsp;&nbsp;
              {item.label}
            </div>
          ),
        }));
        setReadOnlyTables(tmp);
      }
    } catch (err) {
      message.error("获取参考表失败");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchReferenceTables = useCallback(
    debounce((dataSourceId: string, matchMode: string, keyword: string) => {
      fetchReferenceTables(dataSourceId, matchMode, keyword);
    }, 500),
    []
  );

  return {
    data,
    multiTableList,
    readOnlyTables,
    loading,
    tableKeyword,
    setMultiTableList,
    setTableKeyword,
    setReadOnlyTables,
    fetchTables,
    fetchReferenceTables,
    debouncedFetchReferenceTables,
  };
};
