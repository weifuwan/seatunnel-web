package org.apache.seatunnel.web.api.exceptions;


import org.apache.seatunnel.web.api.enums.Status;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

/**
 * controller exception annotation
 */
@Retention(RUNTIME)
@Target(METHOD)
public @interface ApiException {

    Status value();
}
