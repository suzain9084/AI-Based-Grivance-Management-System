import json

import requests
from flask import Request, Response
from requests import RequestException

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
}

STRIP_UPSTREAM_RESPONSE_HEADERS = HOP_BY_HOP_HEADERS | {
    "content-encoding",
    "content-length",
    "access-control-allow-origin",
    "access-control-allow-credentials",
    "access-control-allow-headers",
    "access-control-allow-methods",
    "access-control-expose-headers",
    "access-control-max-age",
}


def _filter_headers(headers, extra_exclude=None):
    excluded = set(HOP_BY_HOP_HEADERS) | {"host"}
    if extra_exclude:
        excluded.update(extra_exclude)
    return {
        key: value
        for key, value in headers.items()
        if key.lower() not in excluded
    }


def proxy_to_service(base_url: str, path: str, req: Request) -> Response:
    if not base_url:
        return Response(
            json.dumps({"message": "Upstream service is not configured"}),
            status=502,
            mimetype="application/json",
        )

    target_url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"
    incoming_headers = {key: value for key, value in req.headers}
    request_kwargs = {
        "params": req.args,
        "allow_redirects": False,
        "timeout": 120,
    }

    try:
        if req.files:
            request_kwargs["headers"] = _filter_headers(
                incoming_headers, extra_exclude={"content-type"}
            )
            request_kwargs["data"] = req.form.to_dict(flat=True)
            request_kwargs["files"] = [
                (
                    key,
                    (
                        uploaded.filename,
                        uploaded.stream,
                        uploaded.content_type or "application/octet-stream",
                    ),
                )
                for key, uploaded in req.files.items()
            ]
        elif req.form:
            request_kwargs["headers"] = _filter_headers(
                incoming_headers, extra_exclude={"content-type"}
            )
            request_kwargs["data"] = req.form.to_dict(flat=True)
        else:
            request_kwargs["headers"] = _filter_headers(incoming_headers)
            request_kwargs["data"] = req.get_data()

        upstream = requests.request(req.method, target_url, **request_kwargs)
    except RequestException:
        return Response(
            json.dumps({"message": "Upstream service unavailable"}),
            status=502,
            mimetype="application/json",
        )

    response_headers = {
        key: value
        for key, value in dict(upstream.headers).items()
        if key.lower() not in STRIP_UPSTREAM_RESPONSE_HEADERS
    }
    return Response(upstream.content, status=upstream.status_code, headers=response_headers)
