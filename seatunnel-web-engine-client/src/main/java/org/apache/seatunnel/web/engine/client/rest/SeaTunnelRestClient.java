package org.apache.seatunnel.web.engine.client.rest;

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
public class SeaTunnelRestClient {

    private final RestTemplate restTemplate;
    private final SeaTunnelClientResolver seatunnelClientResolver;

    public SeaTunnelRestClient(RestTemplate restTemplate,
                               SeaTunnelClientResolver seatunnelClientResolver) {
        this.restTemplate = restTemplate;
        this.seatunnelClientResolver = seatunnelClientResolver;
    }

    private String url(Long clientId, String path) {
        String baseApiUrl = seatunnelClientResolver.resolveBaseApiUrl(clientId);
        if (path == null || path.isEmpty()) {
            return baseApiUrl;
        }
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
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

    private String safe(String s) {
        return s == null ? "" : s;
    }

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

    public Map overview(Long clientId, Map<String, String> tags) {
        String baseUrl = url(clientId, "/overview");
        return overview(baseUrl, tags);
    }

    public Map overview(String baseUrl, Map<String, String> tags) {
        try {
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(baseUrl);
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

    public List runningJobs(Long clientId) {
        try {
            return restTemplate.getForObject(url(clientId, "/running-jobs"), List.class);
        } catch (Exception e) {
            throw wrap(e, "GET /running-jobs failed");
        }
    }

    public Map jobInfo(Long clientId, long jobId) {
        try {
            return restTemplate.getForObject(url(clientId, "/job-info/" + jobId), Map.class);
        } catch (Exception e) {
            throw wrap(e, "GET /job-info/{jobId} failed");
        }
    }

    public List finishedJobs(Long clientId, String state) {
        try {
            if (state == null || state.trim().isEmpty()) {
                state = "UNKNOWABLE";
            }
            return restTemplate.getForObject(url(clientId, "/finished-jobs/" + state), List.class);
        } catch (Exception e) {
            throw wrap(e, "GET /finished-jobs/{state} failed");
        }
    }

    public List systemMonitoringInformation(Long clientId) {
        try {
            return restTemplate.getForObject(url(clientId, "/system-monitoring-information"), List.class);
        } catch (Exception e) {
            throw wrap(e, "GET /system-monitoring-information failed");
        }
    }

    public Object logs(Long clientId, Long jobIdOrNull, String formatOrNull) {
        try {
            String path = (jobIdOrNull == null) ? "/logs" : ("/logs/" + jobIdOrNull);
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url(clientId, path));
            if (formatOrNull != null && !formatOrNull.trim().isEmpty()) {
                b.queryParam("format", formatOrNull);
            }
            return restTemplate.getForObject(b.build(true).toUri(), Object.class);
        } catch (Exception e) {
            throw wrap(e, "GET /logs failed");
        }
    }

    public Object nodeLogs(Long clientId) {
        try {
            return restTemplate.getForObject(url(clientId, "/log"), Object.class);
        } catch (Exception e) {
            throw wrap(e, "GET /log failed");
        }
    }

    public String metrics(Long clientId, boolean openMetrics) {
        try {
            String path = openMetrics ? "/openmetrics" : "/metrics";
            ResponseEntity<String> resp = restTemplate.exchange(
                    url(clientId, path),
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

    public Map submitJobText(Long clientId,
                             String configText,
                             String format,
                             String jobId,
                             String jobName,
                             Boolean isStartWithSavePoint) {
        try {
            if (format == null || format.trim().isEmpty()) {
                format = "json";
            }

            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url(clientId, "/submit-job"))
                    .queryParam("format", format);

            if (jobId != null && !jobId.trim().isEmpty()) {
                b.queryParam("jobId", jobId);
            }
            if (jobName != null && !jobName.trim().isEmpty()) {
                b.queryParam("jobName", jobName);
            }
            if (isStartWithSavePoint != null) {
                b.queryParam("isStartWithSavePoint", isStartWithSavePoint);
            }

            HttpEntity<String> entity = new HttpEntity<>(configText == null ? "" : configText, textHeaders());
            return restTemplate.postForObject(b.build(true).toUri(), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, e.getMessage());
        }
    }

    public Map submitJobJson(Long clientId,
                             Object configJsonObject,
                             String jobId,
                             String jobName,
                             Boolean isStartWithSavePoint) {
        try {
            UriComponentsBuilder b = UriComponentsBuilder.fromHttpUrl(url(clientId, "/submit-job"))
                    .queryParam("format", "json");

            if (jobId != null && !jobId.trim().isEmpty()) {
                b.queryParam("jobId", jobId);
            }
            if (jobName != null && !jobName.trim().isEmpty()) {
                b.queryParam("jobName", jobName);
            }
            if (isStartWithSavePoint != null) {
                b.queryParam("isStartWithSavePoint", isStartWithSavePoint);
            }

            HttpEntity<Object> entity = new HttpEntity<>(configJsonObject, jsonHeaders());
            return restTemplate.postForObject(b.build(true).toUri(), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /submit-job(json) failed");
        }
    }

    public Map submitJobUpload(Long clientId, byte[] fileBytes, String filename) {
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
                    url(clientId, "/submit-job/upload"),
                    HttpMethod.POST,
                    req,
                    Map.class
            );
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, e.getMessage());
        }
    }

    public List submitJobsBatch(Long clientId, List jobConfigs) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(jobConfigs, jsonHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(
                    url(clientId, "/submit-jobs"),
                    HttpMethod.POST,
                    entity,
                    List.class
            );
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, "POST /submit-jobs failed");
        }
    }

    public Map stopJob(Long clientId, long jobId, boolean isStopWithSavePoint) {
        try {
            Map<String, Object> body = new java.util.LinkedHashMap<>();
            body.put("jobId", jobId);
            body.put("isStopWithSavePoint", isStopWithSavePoint);

            HttpEntity<Object> entity = new HttpEntity<>(body, jsonHeaders());
            return restTemplate.postForObject(url(clientId, "/stop-job"), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /stop-job failed");
        }
    }

    public List stopJobsBatch(Long clientId, List<Map<String, Object>> items) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(items, jsonHeaders());
            ResponseEntity<List> resp = restTemplate.exchange(
                    url(clientId, "/stop-jobs"),
                    HttpMethod.POST,
                    entity,
                    List.class
            );
            return resp.getBody();
        } catch (Exception e) {
            throw wrap(e, "POST /stop-jobs failed");
        }
    }

    public Map encryptConfig(Long clientId, Object config) {
        try {
            HttpEntity<Object> entity = new HttpEntity<>(config, jsonHeaders());
            return restTemplate.postForObject(url(clientId, "/encrypt-config"), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /encrypt-config failed");
        }
    }

    public Map updateTags(Long clientId, Map<String, String> tags) {
        try {
            Map<String, String> body = (tags == null) ? Collections.emptyMap() : tags;
            HttpEntity<Object> entity = new HttpEntity<>(body, jsonHeaders());
            return restTemplate.postForObject(url(clientId, "/update-tags"), entity, Map.class);
        } catch (Exception e) {
            throw wrap(e, "POST /update-tags failed");
        }
    }

    public Map submitJobUploadText(Long clientId, String text, String filename) {
        byte[] bytes = (text == null ? "" : text).getBytes(StandardCharsets.UTF_8);
        return submitJobUpload(clientId, bytes, filename);
    }
}