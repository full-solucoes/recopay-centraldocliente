# Cabeçalhos de hospedagem

`public/_headers` documenta o mínimo usado na hospedagem oficial. Em Nginx, converta cada linha em `add_header ... always`. Se a API mudar, ajuste `connect-src`; não adicione `unsafe-eval`. Use somente HTTPS, preserve HSTS, `frame-ancestors 'none'`, `nosniff` e a política de referência. Variáveis `VITE_*` são públicas e incorporadas ao bundle.
