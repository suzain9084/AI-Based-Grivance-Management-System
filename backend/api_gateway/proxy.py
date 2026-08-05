import requests
from flask import Request, Response

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


def _filter_headers(headers, drop_content_type=False):
    excluded = set(HOP_BY_HOP_HEADERS) | {"host"}
    if drop_content_type:
        excluded.add("content-type")
    return {
        key: value
        for key, value in headers.items()
        if key.lower() not in excluded
    }


def proxy_to_service(base_url: str, path: str, req: Request) -> Response:
    target_url = f"{base_url.rstrip('/')}/{path.lstrip('/')}"
    incoming_headers = {key: value for key, value in req.headers}

    if req.files:
        headers = _filter_headers(incoming_headers, drop_content_type=True)
        files = [
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
        upstream = requests.request(
            req.method,
            target_url,
            headers=headers,
            params=req.args,
            data=req.form.to_dict(flat=True),
            files=files,
            allow_redirects=False,
            timeout=120,
        )
    elif req.form:
        headers = _filter_headers(incoming_headers, drop_content_type=True)
        upstream = requests.request(
            req.method,
            target_url,
            headers=headers,
            params=req.args,
            data=req.form.to_dict(flat=True),
            allow_redirects=False,
            timeout=120,
        )
    else:
        headers = _filter_headers(incoming_headers)
        upstream = requests.request(
            req.method,
            target_url,
            headers=headers,
            params=req.args,
            data=req.get_data(),
            allow_redirects=False,
            timeout=120,
        )

    response_headers = _filter_headers(dict(upstream.headers))
    return Response(upstream.content, status=upstream.status_code, headers=response_headers)
