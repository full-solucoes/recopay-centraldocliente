$ErrorActionPreference = 'Stop'
$raizRepositorio = (Resolve-Path '.').Path.Replace('\\', '/')
$arquivos = @(git -c "safe.directory=$raizRepositorio" ls-files --cached --others --exclude-standard | Where-Object { Test-Path -LiteralPath $_ })
if ($LASTEXITCODE -ne 0) { throw 'Nao foi possivel enumerar os arquivos rastreados pelo Git.' }
$proibidos = @($arquivos | Where-Object { $_ -match '(^|/)(\.env($|\.)|dist/|node_modules/)|\.(pfx|p12|pem|key|sql|bak|dump|xlsx?|docx?)$' -and $_ -notmatch '\.env\.example$' })
if ($proibidos.Count) { throw "Arquivos proibidos rastreados: $($proibidos -join ', ')" }
git -c "safe.directory=$raizRepositorio" diff --check
if ($LASTEXITCODE -ne 0) { throw 'O Git encontrou marcadores de conflito ou erros de espacos em branco.' }
npm ci
if ($LASTEXITCODE -ne 0) { throw 'npm ci falhou.' }
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) { throw 'npm audit encontrou vulnerabilidade relevante ou nao conseguiu consultar o registro.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'O build de producao falhou.' }
if (Get-ChildItem dist -Recurse -Filter *.map) { throw 'Source maps encontrados no build.' }
Write-Host "Validacao local aprovada. Arquivos avaliados: $($arquivos.Count). Publique por git archive ou clone limpo."
