@echo off
echo ========================================
echo    Configuracao do arquivo .env
echo ========================================
echo.

if exist .env (
    echo ✅ Arquivo .env ja existe!
    echo.
    echo Deseja sobrescrever? (s/n)
    set /p choice="Escolha: "
    if /i "%choice%"=="n" (
        echo ❌ Operacao cancelada.
        pause
        exit /b
    )
)

echo 📋 Copiando .env.example para .env...
copy .env.example .env >nul

if %errorlevel% equ 0 (
    echo ✅ Arquivo .env criado com sucesso!
    echo.
    echo ⚠️  IMPORTANTE: Configure suas credenciais de email no arquivo .env
    echo.
    echo 📧 Para usar Gmail:
    echo    1. Ative a verificacao em duas etapas
    echo    2. Gere uma senha de app em: https://myaccount.google.com/apppasswords
    echo    3. Configure EMAIL_USERNAME e EMAIL_PASSWORD no .env
    echo.
    echo 📖 Consulte CONFIGURACAO_ENV.md para instrucoes detalhadas
    echo.
    echo 🚀 Apos configurar, reinicie o backend com: ./mvnw spring-boot:run
) else (
    echo ❌ Erro ao criar o arquivo .env
)

echo.
pause