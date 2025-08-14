#!/bin/bash

echo "========================================"
echo "    Configuração do arquivo .env"
echo "========================================"
echo

if [ -f ".env" ]; then
    echo "✅ Arquivo .env já existe!"
    echo
    read -p "Deseja sobrescrever? (s/n): " choice
    if [[ "$choice" != "s" && "$choice" != "S" ]]; then
        echo "❌ Operação cancelada."
        exit 0
    fi
fi

echo "📋 Copiando .env.example para .env..."
cp .env.example .env

if [ $? -eq 0 ]; then
    echo "✅ Arquivo .env criado com sucesso!"
    echo
    echo "⚠️  IMPORTANTE: Configure suas credenciais de email no arquivo .env"
    echo
    echo "📧 Para usar Gmail:"
    echo "   1. Ative a verificação em duas etapas"
    echo "   2. Gere uma senha de app em: https://myaccount.google.com/apppasswords"
    echo "   3. Configure EMAIL_USERNAME e EMAIL_PASSWORD no .env"
    echo
    echo "📖 Consulte CONFIGURACAO_ENV.md para instruções detalhadas"
    echo
    echo "🚀 Após configurar, reinicie o backend com: ./mvnw spring-boot:run"
else
    echo "❌ Erro ao criar o arquivo .env"
fi

echo
read -p "Pressione Enter para continuar..."