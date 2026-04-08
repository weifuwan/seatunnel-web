package org.apache.seatunnel.web.core.verify.executor;

import org.apache.seatunnel.web.common.enums.JobStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Parse weakly typed SeaTunnel REST responses.
 */
@Component
@SuppressWarnings("rawtypes")
public class SeaTunnelJobResponseParser {

    public Long extractJobId(Map submitResponse) {
        if (submitResponse == null || submitResponse.isEmpty()) {
            return null;
        }

        Object direct = firstNonNull(
                submitResponse.get("jobId"),
                submitResponse.get("job_id"),
                submitResponse.get("id")
        );
        Long parsedDirect = toLong(direct);
        if (parsedDirect != null) {
            return parsedDirect;
        }

        Object data = submitResponse.get("data");
        if (data instanceof Map) {
            Map dataMap = (Map) data;
            Object nested = firstNonNull(
                    dataMap.get("jobId"),
                    dataMap.get("job_id"),
                    dataMap.get("id")
            );
            return toLong(nested);
        }

        return null;
    }

    public JobStatus extractStatus(Map info) {
        if (info == null || info.isEmpty()) {
            return null;
        }

        Object direct = firstNonNull(
                info.get("status"),
                info.get("jobStatus"),
                info.get("state")
        );
        JobStatus directStatus = toJobStatus(direct);
        if (directStatus != null) {
            return directStatus;
        }

        Object data = info.get("data");
        if (data instanceof Map) {
            Map dataMap = (Map) data;
            Object nested = firstNonNull(
                    dataMap.get("status"),
                    dataMap.get("jobStatus"),
                    dataMap.get("state")
            );
            return toJobStatus(nested);
        }

        return null;
    }

    public boolean containsJob(List list, Long jobId) {
        if (list == null || list.isEmpty() || jobId == null) {
            return false;
        }

        for (Object item : list) {
            if (item instanceof Map) {
                Map map = (Map) item;
                Long id = toLong(firstNonNull(
                        map.get("jobId"),
                        map.get("job_id"),
                        map.get("id")
                ));
                if (jobId.equals(id)) {
                    return true;
                }
            }
        }
        return false;
    }

    public JobStatus toJobStatus(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return JobStatus.fromString(String.valueOf(value));
        } catch (Exception ignored) {
            return null;
        }
    }

    public Long toLong(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return Long.parseLong(String.valueOf(value));
        } catch (Exception ignored) {
            return null;
        }
    }

    private Object firstNonNull(Object... values) {
        if (values == null) {
            return null;
        }

        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }
}