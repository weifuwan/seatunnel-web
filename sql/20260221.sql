CREATE TABLE `cdc_server_ids` (
                                  `server_id` int NOT NULL,
                                  `job_id` varchar(64) DEFAULT NULL,
                                  `allocated_at` timestamp NULL DEFAULT NULL,
                                  PRIMARY KEY (`server_id`),
                                  UNIQUE KEY `uq_job_jobid_server` (`job_id`,`server_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

