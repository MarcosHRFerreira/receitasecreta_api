// Script para testar login e obter token
const axios = require('axios');

const BASE_URL = 'http://localhost:8082/receitasecreta';

async function testLogin() {
    try {
        console.log('🔐 Testando login...');
        
        // Fazer login
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            login: 'admin@admin.com',
            password: 'admin123'
        });
        
        console.log('✅ Login bem-sucedido!');
        console.log('Token:', loginResponse.data.token.substring(0, 20) + '...');
        console.log('Usuário:', loginResponse.data.user.username);
        
        const token = loginResponse.data.token;
        
        // Testar API de produtos com token
        console.log('\n🛒 Testando API de produtos...');
        const produtosResponse = await axios.get(`${BASE_URL}/produtos`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ API de produtos funcionando!');
        console.log('Produtos encontrados:', produtosResponse.data.content.length);
        console.log('Primeiro produto:', produtosResponse.data.content[0]?.nomeProduto || 'Nenhum produto');
        
        // Salvar token para uso posterior
        const fs = require('fs');
        fs.writeFileSync('C:\\temp\\token.txt', token);
        console.log('\n💾 Token salvo em C:\\temp\\token.txt');
        
    } catch (error) {
        console.error('❌ Erro:', error.response?.data || error.message);
    }
}

testLogin();