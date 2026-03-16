package org.apache.seatunnel.web.engine.client.client;

import org.apache.seatunnel.web.engine.client.exceptions.SeatunnelClientException;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@SuppressWarnings({"unchecked", "rawtypes"})
@Service
public class SeatunnelRestClient {

    private final RestTemplate restTemplate;
    private final String baseApiUrl;

    public SeatunnelRestClient(RestTemplate restTemplate, String baseApiUrl) {
        this.restTemplate = restTemplate;
        this.baseApiUrl = baseApiUrl;
    }

    private String url(String path) {
        if (path == null || path.isEmpty()) return baseApiUrl;
        if (!path.startsWith("/")) path = "/" + path;
        return baseApiUrl + path;
    }

    private RuntimeException wrap(Exception e, String hint) {
        if (e instanceof HttpStatusCodeException) {
            HttpStatusCodeException he = (HttpStatusCodeException) e;
            return new SeatunnelClientException(
                    hint,
                    he.getRawStatusCode(),
                    safe(he.getResponseBodyAsString()),
                    he
            );
        }
        return new SeatunnelClientException(hint, -1, "", e);
    }

    private String safe(String s) { return s == null ? "" : s; }

    private HttpHeaders jsonHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        h.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return h;
    }

    private HttpHeaders textHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.TEXT_PLAIN);
        h.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        return h;
    }

    /* ===================== GET ===================== */

    public Map overview(Map<String, String> tags) {
        try {
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url("/overview"));
            if (tags != null) {
                for (Map.Entry<String, String> e : tags.entrySet()) {
                    b.queryParam(e.getKey(), e.getValue());
                }
            }
            return restTemplate.getForObject(b.build(true).toUri(), Map.class);
        } catch (Exception e) {
            throw wrap(e, "GET /overview failed");
        }
    }

    public List runningJobs() {
        try {
            return restTemplate.getForObject(url("/running-jobs"), List.class);
        } catch (Exception e) {
            throw wrap(e, "GET /running-jobs failed");
        }
    }

    public Map jobInfo(long jobId) {
        try {
            return restTemplate.getForObject(url("/job-info/" + jobId), Map.class);
        } catch (Exception e) {
            throw wrap(e, "GET /job-info/{jobId} failed");
        }
    }

    public List finishedJobs(String state) {
        try {
            if (state == null || state.trim().isEmpty()) state = "UNKNOWABLE";
            return restTemplate.getForObject(url("/finished-jobs/" + state), List.class);
        } catch (Exception e) {
            throw wrap(e, "GET /finished-jobs/{state} failed");
        }
    }

    public List systemMonitoringInformation() {
        try {
            return restTemplate.getForObject(url("/system-monitoring-information"), List.class);
        } catch (Exception e) {
            throw wrap(e, "GET /system-monitoring-information failed");
        }
    }

    public Object logs(Long jobIdOrNull, String formatOrNull) {
        try {
            String path = (jobIdOrNull == null) ? "/logs" : ("/logs/" + jobIdOrNull);
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url(path));
            if (formatOrNull != null && !formatOrNull.trim().isEmpty()) {
                b.queryParam("format", formatOrNull);
            }
            return restTemplate.getForObject(b.build(true).toUri(), Object.class);
        } catch (Exception e) {
            throw wrap(e, "GET /logs failed");
        }
    }

    public Object nodeLogs() {
        try {
            return restTemplate.getForObject(url("/log"), Object.class);
        } catch (Exception e) {
            throw wrap(e, "GET /log failed");
        }
    }

    public String metrics(boolean openMetrics) {
        try {
            String path = openMetrics ? "/openmetrics" : "/metrics";
            ResponseEntity<String> resp = restTemplate.exchange(
                    url(path),
                    HttpMethod.GET,
                    new HttpEntity<Void>((Void) null, new HttpHeaders()),
                    String.class
            );
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, "GET /metrics failed");
        }
    }

    /* ===================== POST ===================== */

    public Map submitJobText(String configText, String format, String jobId, String jobName, Boolean isStartWithSavePoint) {
        try {
            if (format == null || format.trim().isEmpty()) format = "json";

            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url("/submit-job"))
                    .queryParam("format", format);

            if (jobId != null && !jobId.trim().isEmpty()) b.queryParam("jobId", jobId);
            if (jobName != null && !jobName.trim().isEmpty()) b.queryParam("jobName", jobName);
            if (isStartWithSavePoint != null) b.queryParam("isStartWithSavePoint", isStartWithSavePoint);

            HttpEntity<String> entity = new HttpEntity<>(configText == null ? "" : configText, textHeaders());
            return restTemplate.postForObject(b.build(true).toUri(), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job failed");
        }
    }

    public Map submitJobJson(Object configJsonObject, String jobId, String jobName, Boolean isStartWithSavePoint) {
        try {
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url("/submit-job"))
                    .queryParam("format", "json");

            if (jobId != null && !jobId.trim().isEmpty()) b.queryParam("jobId", jobId);
            if (jobName != null && !jobName.trim().isEmpty()) b.queryParam("jobName", jobName);
            if (isStartWithSavePoint != null) b.queryParam("isStartWithSavePoint", isStartWithSavePoint);

            HttpEntity<Object> entity = new HttpEntity<>(configJsonObject, jsonHeaders());
            return restTemplate.postForObject(b.build(true).toUri(), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job(json) failed");
        }
    }

    public Map submitJobUpload(byte[] fileBytes, String filename) {
        try {
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            ByteArrayResource resource = new ByteArrayResource(fileBytes == null ? new byte[0] : fileBytes) {
                @Override
                public String getFilename() {
                    return (filename == null || filename.isBlank()) ? "job.conf" : filename;
                }
            };

            body.add("config_file", resource);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));

            HttpEntity<MultiValueMap<String, Object>> req = new HttpEntity<>(body, headers);

            ResponseEntity<Map> resp = restTemplate.exchange(
                    url("/submit-job/upload"),
                    HttpMethod.POST,
                    req,
                    Map.class
            );
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job/upload failed");
        }
    }

    public List submitJobsBatch(List jobConfigs) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(jobConfigs, jsonHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(url("/submit-jobs"), HttpMethod.POST, entity, List.class);
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, "POST /submit-jobs failed");
        }
    }

    public Map stopJob(long jobId, boolean isStopWithSavePoint) {
        try {
            Map<String, Object> body = new java.util.LinkedHashMap<>();
            body.put("jobId", jobId);
            body.put("isStopWithSavePoint", isStopWithSavePoint);

            HttpEntity<Object> entity = new HttpEntity<>(body, jsonHeaders());
            return restTemplate.postForObject(url("/stop-job"), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /stop-job failed");
        }
    }

    public List stopJobsBatch(List<Map<String, Object>> items) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(items, jsonHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(url("/stop-jobs"), HttpMethod.POST, entity, List.class);
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, "POST /stop-jobs failed");
        }
    }

    public Map encryptConfig(Object config) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(config, jsonHeaders());
            return restTemplate.postForObject(url("/encrypt-config"), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /encrypt-config failed");
        }
    }

    public Map updateTags(Map<String, String> tags) {
        try {
            Map<String, String> body = (tags == null) ? Collections.emptyMap() : tags;
            HttpEntity<Object> entity = new HttpEntity<>(body, jsonHeaders());
            return restTemplate.postForObject(url("/update-tags"), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /update-tags failed");
        }
    }

    public Map submitJobUploadText(String text, String filename) {
        byte[] bytes = (text == null ? "" : text).getBytes(StandardCharsets.UTF_8);
        return submitJobUpload(bytes, filename);
    }
}