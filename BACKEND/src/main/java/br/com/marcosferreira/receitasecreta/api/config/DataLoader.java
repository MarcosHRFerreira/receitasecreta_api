package br.com.marcosferreira.receitasecreta.api.config;

import br.com.marcosferreira.receitasecreta.api.models.User;
import br.com.marcosferreira.receitasecreta.api.models.ProdutoModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteModel;
import br.com.marcosferreira.receitasecreta.api.models.ReceitaIngredienteId;
import br.com.marcosferreira.receitasecreta.api.enums.UserRole;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaProduto;
import br.com.marcosferreira.receitasecreta.api.enums.CategoriaReceita;
import br.com.marcosferreira.receitasecreta.api.enums.Dificuldade;
import br.com.marcosferreira.receitasecreta.api.enums.UnidadeMedida;
import br.com.marcosferreira.receitasecreta.api.repositories.UserRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.ProdutoRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaRepository;
import br.com.marcosferreira.receitasecreta.api.repositories.ReceitaIngredienteRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

/**
 * Classe responsável por carregar dados iniciais no banco de dados.
 * Executa automaticamente após a inicialização da aplicação.
 */
@Component
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProdutoRepository produtoRepository;
    private final ReceitaRepository receitaRepository;
    private final ReceitaIngredienteRepository receitaIngredienteRepository;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, 
                     ProdutoRepository produtoRepository,
                     ReceitaRepository receitaRepository,
                     ReceitaIngredienteRepository receitaIngredienteRepository,
                     PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.produtoRepository = produtoRepository;
        this.receitaRepository = receitaRepository;
        this.receitaIngredienteRepository = receitaIngredienteRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        loadInitialData();
    }

    private void loadInitialData() {
        // Verificar se já existe o usuário administrador
        if (userRepository.findByLogin("admin") == null) {
            createAdminUser();
        }
        
        // Verificar se já existem produtos
        if (produtoRepository.count() == 0) {
            createSampleProducts();
        }
        
        // Verificar se já existem receitas
        if (receitaRepository.count() == 0) {
            createSampleRecipes();
        }
    }

    private void createAdminUser() {
        User adminUser = new User();
        adminUser.setLogin("admin");
        adminUser.setEmail("admin@receitasecreta.com");
        adminUser.setPassword(passwordEncoder.encode("admin123"));
        adminUser.setRole(UserRole.ADMIN);

        userRepository.save(adminUser);
        
        System.out.println("✅ Usuário administrador criado com sucesso!");
        System.out.println("   Login: admin");
        System.out.println("   Senha: admin123");
        System.out.println("   Role: ADMIN");
    }

    private void createSampleProducts() {
        System.out.println("🛒 Criando produtos de exemplo...");
        
        List<ProdutoModel> produtos = new ArrayList<>();
        
        // Ingredientes básicos para panificação
        produtos.add(createProduct("Farinha de Trigo", "Farinha de trigo especial para panificação", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.KILO));
        produtos.add(createProduct("Açúcar Cristal", "Açúcar cristal refinado", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.KILO));
        produtos.add(createProduct("Ovos", "Ovos frescos de galinha", CategoriaProduto.LATICINIO, UnidadeMedida.UNIDADE));
        produtos.add(createProduct("Leite Integral", "Leite integral pasteurizado", CategoriaProduto.LATICINIO, UnidadeMedida.LITRO));
        produtos.add(createProduct("Manteiga", "Manteiga sem sal", CategoriaProduto.LATICINIO, UnidadeMedida.GRAMA));
        produtos.add(createProduct("Fermento em Pó", "Fermento químico em pó", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.GRAMA));
        produtos.add(createProduct("Sal", "Sal refinado", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.GRAMA));
        produtos.add(createProduct("Chocolate em Pó", "Chocolate em pó 100% cacau", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.GRAMA));
        produtos.add(createProduct("Baunilha", "Essência de baunilha", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.LITRO));
        produtos.add(createProduct("Maçã", "Maçã vermelha fresca", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.UNIDADE));
        produtos.add(createProduct("Canela em Pó", "Canela em pó", CategoriaProduto.INGREDIENTE_SECO, UnidadeMedida.GRAMA));
        produtos.add(createProduct("Creme de Leite", "Creme de leite fresco", CategoriaProduto.LATICINIO, UnidadeMedida.LITRO));
        
        produtoRepository.saveAll(produtos);
        System.out.println("✅ " + produtos.size() + " produtos criados com sucesso!");
    }
    
    private ProdutoModel createProduct(String nome, String descricao, CategoriaProduto categoria, UnidadeMedida unidade) {
        ProdutoModel produto = new ProdutoModel();
        produto.setNome(nome);
        produto.setDescricao(descricao);
        produto.setCategoriaproduto(categoria);
        produto.setUnidademedida(unidade);
        produto.setDataCriacao(LocalDateTime.now());
        produto.setDataAlteracao(LocalDateTime.now());
        
        // Campos de auditoria obrigatórios
        produto.setUserId("system");
        produto.setCreatedBy("system");
        produto.setCreatedAt(LocalDateTime.now());
        
        return produto;
    }

    private void createSampleRecipes() {
        System.out.println("🍰 Criando receitas de exemplo...");
        
        // Buscar o usuário admin para associar às receitas
        List<User> allUsers = userRepository.findAll();
        User adminUser = allUsers.stream()
            .filter(user -> user.getLogin().equals("admin"))
            .findFirst()
            .orElse(null);
        
        if (adminUser == null) {
            System.out.println("❌ Usuário admin não encontrado. Pulando criação de receitas.");
            return;
        }
        
        List<ReceitaModel> receitas = new ArrayList<>();
        
        // Receita 1: Bolo de Chocolate
        ReceitaModel boloChocolate = createRecipe(
            "Bolo de Chocolate",
            "Um delicioso bolo de chocolate fofinho e saboroso",
            CategoriaReceita.BOLO,
            Dificuldade.FACIL,
            "30 minutos",
            "8 porções",
            "1. Pré-aqueça o forno a 180°C.\n" +
            "2. Em uma tigela, misture a farinha, o açúcar, o chocolate em pó, o fermento e o sal.\n" +
            "3. Em outra tigela, bata os ovos, adicione o leite, a manteiga derretida e a baunilha.\n" +
            "4. Misture os ingredientes secos com os líquidos até formar uma massa homogênea.\n" +
            "5. Despeje a massa em uma forma untada e enfarinhada.\n" +
            "6. Asse por 35-40 minutos ou até que um palito saia limpo.\n" +
            "7. Deixe esfriar antes de desenformar.",
            "Perfeito para sobremesa ou lanche da tarde",
            adminUser.getId().toString()
        );
        receitas.add(boloChocolate);
        
        // Receita 2: Torta de Maçã
        ReceitaModel tortaMaca = createRecipe(
            "Torta de Maçã",
            "Torta de maçã tradicional com canela",
            CategoriaReceita.TORTA,
            Dificuldade.COMPLEXA,
            "1 hora",
            "10 porções",
            "1. Prepare a massa: misture farinha, manteiga, açúcar e um ovo até formar uma massa.\n" +
            "2. Descanse a massa por 30 minutos na geladeira.\n" +
            "3. Descasque e corte as maçãs em fatias finas.\n" +
            "4. Misture as maçãs com açúcar e canela.\n" +
            "5. Abra a massa e forre uma forma de torta.\n" +
            "6. Coloque o recheio de maçã sobre a massa.\n" +
            "7. Asse a 180°C por 40-45 minutos até dourar.\n" +
            "8. Sirva morna ou fria.",
            "Deliciosa com sorvete de baunilha",
            adminUser.getId().toString()
        );
        receitas.add(tortaMaca);
        
        receitaRepository.saveAll(receitas);
        System.out.println("✅ " + receitas.size() + " receitas criadas com sucesso!");
        
        // Criar ingredientes para as receitas
        createRecipeIngredients(receitas);
    }
    
    private ReceitaModel createRecipe(String nome, String descricao, CategoriaReceita categoria, 
                                     Dificuldade dificuldade, String tempoPreparo, String rendimento,
                                     String modoPreparo, String notas, String userId) {
        ReceitaModel receita = new ReceitaModel();
        receita.setNomeReceita(nome);
        receita.setCategoria(categoria);
        receita.setDificuldade(dificuldade);
        receita.setTempoPreparo(tempoPreparo);
        receita.setRendimento(rendimento);
        receita.setModoPreparo(modoPreparo);
        receita.setNotas(notas);
        receita.setFavorita(false);
        receita.setUserId(userId);
        receita.setDataCriacao(LocalDateTime.now());
        receita.setDataAlteracao(LocalDateTime.now());
        // Campos obrigatórios de auditoria
        receita.setCreatedBy(userId);
        receita.setCreatedAt(LocalDateTime.now());
        receita.setUpdatedBy(userId);
        return receita;
    }
    
    private void createRecipeIngredients(List<ReceitaModel> receitas) {
        System.out.println("🥄 Criando ingredientes das receitas...");
        
        List<ReceitaIngredienteModel> ingredientes = new ArrayList<>();
        
        // Buscar produtos para usar como ingredientes
        List<ProdutoModel> produtos = produtoRepository.findAll();
        if (produtos.size() >= 8) {
            // Ingredientes para Bolo de Chocolate
            addIngrediente(ingredientes, receitas.get(0), produtos.get(0), 2, UnidadeMedida.XICARA); // Farinha
            addIngrediente(ingredientes, receitas.get(0), produtos.get(1), 1, UnidadeMedida.XICARA); // Açúcar
            addIngrediente(ingredientes, receitas.get(0), produtos.get(2), 3, UnidadeMedida.UNIDADE); // Ovos
            addIngrediente(ingredientes, receitas.get(0), produtos.get(3), 1, UnidadeMedida.XICARA); // Leite
            addIngrediente(ingredientes, receitas.get(0), produtos.get(4), 100, UnidadeMedida.GRAMA); // Manteiga
            addIngrediente(ingredientes, receitas.get(0), produtos.get(5), 50, UnidadeMedida.GRAMA); // Chocolate em pó

            // Ingredientes para Torta de Maçã
            addIngrediente(ingredientes, receitas.get(1), produtos.get(0), 3, UnidadeMedida.XICARA); // Farinha
            addIngrediente(ingredientes, receitas.get(1), produtos.get(1), 1, UnidadeMedida.XICARA); // Açúcar
            addIngrediente(ingredientes, receitas.get(1), produtos.get(2), 2, UnidadeMedida.UNIDADE); // Ovos
            addIngrediente(ingredientes, receitas.get(1), produtos.get(4), 150, UnidadeMedida.GRAMA); // Manteiga
            addIngrediente(ingredientes, receitas.get(1), produtos.get(6), 4, UnidadeMedida.UNIDADE); // Maçãs

            // Ingredientes para Pão Caseiro
            addIngrediente(ingredientes, receitas.get(2), produtos.get(0), 4, UnidadeMedida.XICARA); // Farinha
            addIngrediente(ingredientes, receitas.get(2), produtos.get(1), 2, UnidadeMedida.COLHER); // Açúcar
            addIngrediente(ingredientes, receitas.get(2), produtos.get(3), 1, UnidadeMedida.XICARA); // Leite
            addIngrediente(ingredientes, receitas.get(2), produtos.get(4), 50, UnidadeMedida.GRAMA); // Manteiga
            if (produtos.size() > 7) {
                addIngrediente(ingredientes, receitas.get(2), produtos.get(7), 1, UnidadeMedida.COLHER); // Fermento
            }
        }
        
        receitaIngredienteRepository.saveAll(ingredientes);
        System.out.println("✅ " + ingredientes.size() + " ingredientes de receitas criados com sucesso!");
    }
    
    private void addIngrediente(List<ReceitaIngredienteModel> ingredientes, ReceitaModel receita, 
                               ProdutoModel produto, int quantidade, UnidadeMedida unidade) {
        ReceitaIngredienteModel ingrediente = new ReceitaIngredienteModel();
        ReceitaIngredienteId id = new ReceitaIngredienteId();
        id.setReceitaId(receita.getReceitaId());
        id.setIngredienteId(produto.getProdutoId());
        
        ingrediente.setId(id);
        // ingrediente.setReceita(receita); // Não existe este método
        ingrediente.setProduto(produto);
        ingrediente.setQuantidade(quantidade);
        ingrediente.setUnidadeMedida(unidade);
        
        ingredientes.add(ingrediente);
    }
}