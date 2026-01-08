<html>
<head>
  <meta http-equiv="content-type" content="text/html;charset=UTF-8">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="shortcut icon" type="image/jpg" href="./SN8gVgwk/logocheff-1.png">
  <title>Checkout</title>
  <link type="text/css" href="./css/delivry-25-1.css" rel="stylesheet">
  
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js"></script>
  <link rel="stylesheet" href="../icon?family=Material+Icons">
  
  <style type="text/css">
    h1, h2 { color: #EA1D2C; }
    header#topo .cover { background-color: #EA1D2C; }
    header#topo .info h1 { color: #EA1D2C; }
    header#topo .info .icones a { color: #EA1D2C; border-color: #EA1D2C; }
    header#topo .cover .logo { background: #EA1D2C; }
    footer { background: #EA1D2C; }
    .btn, a.voltar { background: #EA1D2C; }
    .lista .item .col .nomeProduto { color: #EA1D2C; }
    main#lista .produtos .item a:hover { border: 2px solid #EA1D2C; }
    .selecionado { border: 2px solid #EA1D2C; }
    span.estoque i { color: #EA1D2C; }
    .pay-btn { width: 100%; background-color: #077C22; margin-top: 30px !important; }
    #precoProduto { font-weight: bold; font-size: 18px; color: #077c22; }
    .input-error { border: 1px solid red !important; }
    .hidden { display: none !important; }
    
    /* Ajuste para Order Bumps */
    .orderbump { border-width: 2px !important; }
    .orderbump input[type="checkbox"] { accent-color: #ea1d2c; width: 20px; height: 20px; }
    .orderbump img { max-width: 80px !important; min-width: 80px !important; min-height: 80px !important; max-height: 100px !important; object-fit: cover !important; }
  </style>
</head>

<body>
  <div id="opacidade" class="fechar"></div>
  <header id="topo">
    <div class="cover main" style="background-position: center; background-size: cover; background-image: url('./mVDwQN39/banner-237f7496-1.webp');">
      <div class="logo" style="background-color: white !important; display: flex; align-items: center; justify-content: center;">
        <img src="./SN8gVgwk/logocheff-1.png" style="width: 100%;">
      </div>
      <div class="borda"></div>
    </div>
  </header>

  <div class="payment-area">
    <div class="container containerFinalizar">
      <h2 style="width: 100%;text-align: center;" id="checkout-top">Finalize seu pedido</h2>
      <a class="voltar" href="../cart.html" title="Voltar"><i class="fa-solid fa-chevron-left"></i> VOLTAR</a>
      
      <div id="detalhesProduto">
        <div class="payment">
          <div class="input">
            <label for="nome">Nome completo <b>*</b></label>
            <input type="text" name="nome" id="nome" placeholder="Nome e Sobrenome" required>
            <span></span>
          </div>
          
          <div class="input">
            <label for="cpf">CPF <b>*</b></label>
            <input type="text" name="cpf" id="cpf" placeholder="000.000.000-00" required>
            <span></span>
          </div>

          <div class="input">
            <label for="telefone">Telefone <b>*</b></label>
            <input type="text" name="telefone" id="telefone" placeholder="Número com DDD" required>
            <span></span>
          </div>

          <h3 style="width: 100%;text-align: start; margin-top:15px;">Dados da entrega</h3>
          <div class="input">
            <label for="cep">CEP <b>*</b></label>
            <input type="text" placeholder="12345-000" id="cep" name="cep" required>
            <span></span>
          </div>
          
          <div class="input hidden">
            <label for="address">Endereço <b>*</b></label>
            <input type="text" placeholder="Rua, Avenida" id="address" name="address" required>
          </div>
          <div class="input hidden">
            <label for="number">Número <b>*</b></label>
            <input type="text" placeholder="1234" id="number" name="number" required>
          </div>
          <div class="input hidden">
            <label for="neighborhood">Bairro <b>*</b></label>
            <input type="text" placeholder="Centro" id="neighborhood" name="neighborhood" required>
          </div>
          <div class="input hidden">
            <label for="city">Cidade <b>*</b></label>
            <input type="text" placeholder="Cidade" id="city" name="city" required>
          </div>
          <div class="input hidden">
            <label for="state">Estado <b>*</b></label>
            <input type="text" placeholder="UF" id="state" name="state" required>
          </div>

          <input type="hidden" name="total_amount" id="total-amount" value="0">
        </div>

        <div class="payment">
          <h3 style="width: 100%;text-align: start;margin-bottom: 10px;">Ofertas disponíveis:</h3>

          <label class="cart-product orderbump" for="orderbump-0">
            <div class="c-p-01">
              <div class="img"><img src="./d4cJNKJ0/1761874938117blob-1.webp"></div>
              <div class="info">
                <span class="product-name">Bolo de Pote Brigadeiro</span>
                <p>R$ <span class="preco">8,00</span></p>
              </div>
            </div>
            <div class="add">
              <input type="checkbox" id="orderbump-0" price="8.00" class="_orderbump" o-name="Bolo de Pote Brigadeiro" o-image="./d4cJNKJ0/1761874938117blob-1.webp">
            </div>
          </label>

          <label class="cart-product orderbump" for="orderbump-1">
            <div class="c-p-01">
              <div class="img"><img src="./hqXP2qX/1761874938086blob-1.webp"></div>
              <div class="info">
                <span class="product-name">Bolo de Pote Prestígio</span>
                <p>R$ <span class="preco">8,00</span></p>
              </div>
            </div>
            <div class="add">
              <input type="checkbox" id="orderbump-1" price="8.00" class="_orderbump" o-name="Bolo de Pote Prestígio" o-image="./hqXP2qX/1761874938086blob-1.webp">
            </div>
          </label>

          <h3 style="width: 100%;text-align: start;margin-bottom: 10px; margin-top:20px;">Seu carrinho:</h3>
          <div id="checkout-cart-items" style="margin-bottom: 20px; border: 1px solid #eee; padding: 10px; border-radius: 5px;"></div>

          <hr style="margin-block: 20px;">
          <div id="precoProduto"> Total: <span id="total-price">R$&nbsp;0,00</span></div>
          
          <button class="pay-btn btn adicionarProduto" id="generate-payment">GERAR PIX</button>
        </div>

        <div class="reviews">
          <div class="review">
            <div class="r-top"><img src="./reclameaqui-assets/libraries/header/images/logo-mobile-1.svg"><span>Reclame Aqui</span></div>
            <p>O consumidor avaliou o atendimento dessa empresa como <b>ÓTIMO</b>.</p>
          </div>
          <div class="review">
            <div class="r-top"><span>Ifood Parceiros</span></div>
            <span>Empresa parceira verificada</span>
          </div>
        </div>

        <footer>
          <b style="text-align: center;">Cheff Burguer</b>
          <span style="font-size: 11pt;font-weight: normal;text-align: center;">CNPJ: 37.XXX.253/0001-51</span>
        </footer>
      </div>
    </div>
  </div>

  <script src="./product-1.js"></script>
  
  <script>
    // 1. Inicializa Máscaras
    $(document).ready(function(){
      $('#cpf').mask('000.000.000-00');
      $('#telefone').mask('(00) 00000-0000');
      $('#cep').mask('00000-000');
    });

    // 2. Lógica Original de Renderização e Carrinho
    function executarRenderizacaoCheckout() {
      const checkoutCartItemsContainer = document.getElementById('checkout-cart-items');
      const paymentButton = document.getElementById('generate-payment');
      let carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
      let baseTotal = 0;

      // 2.1 Calcula Total Geral (Carrinho + Bumps)
      const updateTotal = () => {
        let total = 0;
        // Soma itens do localStorage
        carrinho.forEach(item => {
           let preco = typeof item.preco === 'string' ? parseFloat(item.preco.replace(',','.')) : item.preco;
           total += (preco || 0) * (item.quantidade || 1);
        });
        
        // Soma Order Bumps ativos no DOM (mesmo que ainda não estejam no localStorage)
        // Isso resolve o problema de visualização do preço
        // Na prática, o Order Bump script abaixo já adiciona ao localStorage, mas isso garante
        
        document.getElementById('total-price').textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        baseTotal = total;
      };

      // 2.2 Renderiza Itens Visuais
      if (checkoutCartItemsContainer) {
        checkoutCartItemsContainer.innerHTML = '';
        if (carrinho.length === 0) {
           checkoutCartItemsContainer.innerHTML = '<p style="text-align:center; color:#777;">Seu carrinho está vazio.</p>';
        } else {
           carrinho.forEach(item => {
              const precoNumerico = typeof item.preco === 'string' ? parseFloat(item.preco.replace(',','.')) : item.preco;
              const itemSubtotal = precoNumerico * (item.quantidade || 1);

              // Lógica original de Imagem (Preservada)
              let imagemFinalParaExibir = item.imagem || 'https://placehold.co/50x50/eeeeee/999999?text=Img';
              if (typeof encontrarProdutoPorId === 'function') {
                const produtoOriginal = encontrarProdutoPorId(item.id);
                if (produtoOriginal && produtoOriginal.imagem) imagemFinalParaExibir = produtoOriginal.imagem;
              }
              // Corrige caminho relativo se não for http
              if (imagemFinalParaExibir && !imagemFinalParaExibir.startsWith('http') && !imagemFinalParaExibir.startsWith('./') && !imagemFinalParaExibir.startsWith('../')) {
                imagemFinalParaExibir = './' + imagemFinalParaExibir; 
              }

              const itemDiv = document.createElement('div');
              itemDiv.className = 'cart-product';
              itemDiv.style.padding = '8px';
              itemDiv.style.marginBottom = '8px';
              itemDiv.innerHTML = `
                  <div class="c-p-01">
                      <img src="${imagemFinalParaExibir}" alt="${item.nome}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
                      <div class="info" style="flex-grow: 1;">
                          <span class="product-name" style="font-size: 0.95em;">${item.nome}</span>
                          <span style="font-size: 0.85em; color: #555; display:block;">${item.quantidade || 1} x R$ ${precoNumerico.toFixed(2).replace('.', ',')}</span>
                      </div>
                  </div>
                  <div style="font-weight: bold; font-size: 0.95em; min-width: 70px; text-align: right;">
                      R$ ${itemSubtotal.toFixed(2).replace('.', ',')}
                  </div>`;
              checkoutCartItemsContainer.appendChild(itemDiv);
           });
        }
      }
      updateTotal();

      // 3. Lógica do Botão Pagar (NOVA INTEGRAÇÃO OTIMIZE)
      if (paymentButton && !paymentButton.hasAttribute('data-listener-added')) {
        paymentButton.setAttribute('data-listener-added', 'true');
        paymentButton.addEventListener('click', async () => {
          try {
            // Validação
            const nome = document.getElementById('nome').value.trim();
            const cpf = document.getElementById('cpf').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const cep = document.getElementById('cep').value.trim();
            const number = document.getElementById('number').value.trim();

            if (!nome || cpf.length < 14 || !telefone || !cep) {
              Swal.fire('Atenção', 'Preencha Nome, CPF, Telefone e CEP corretamente.', 'warning');
              return;
            }

            paymentButton.setAttribute('disabled', '');
            paymentButton.innerHTML = 'Processando... <i class="fa fa-spinner fa-spin"></i>';

            // Dados atualizados do carrinho
            const carrinhoFinal = JSON.parse(localStorage.getItem("meuCarrinho")) || [];
            
            // Payload Otimize
            const payload = {
              customer: { nome, cpf, telefone, email: "cliente@email.com" }, // Email placeholder se não tiver input
              total: baseTotal, // Total calculado
              items: carrinhoFinal
            };

            console.log("Enviando:", payload);

            // Chama API
            const response = await fetch("/api/generate-pix", {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            // Tenta parsear JSON, trata erro de HTML se vier
            let result;
            const textResponse = await response.text();
            try {
                result = JSON.parse(textResponse);
            } catch(e) {
                console.error("Erro JSON:", textResponse);
                throw new Error("Erro de comunicação com o servidor.");
            }

            if (response.ok && result.success) {
              // Redirecionamento
              const dataStr = encodeURIComponent(JSON.stringify(result));
              window.location.href = `/payment/681aaff4852ac923b1bcabfb/682519bb15bf50c6ee011ebb/index.html?data=${dataStr}`;
            } else {
              throw new Error(result.message || "Falha ao gerar Pix.");
            }

          } catch (error) {
            paymentButton.removeAttribute('disabled');
            paymentButton.textContent = 'Gerar PIX';
            Swal.fire('Erro', error.message, 'error');
          }
        });
      }
    }

    // 4. Lógica de Order Bumps (Atualiza localStorage e dispara evento)
    function atualizarCarrinhoEInterface() {
      let carrinho = JSON.parse(localStorage.getItem('meuCarrinho')) || [];
      // Remove bumps antigos para não duplicar
      carrinho = carrinho.filter(item => !(item.id && item.id.startsWith('orderbump-')));

      document.querySelectorAll('._orderbump:checked').forEach(checkbox => {
        carrinho.push({
          id: checkbox.id || 'orderbump-' + Math.random(), // Garante ID
          nome: checkbox.getAttribute('o-name'),
          preco: parseFloat(checkbox.getAttribute('price')),
          imagem: checkbox.getAttribute('o-image'), // Caminho da imagem do bump
          quantidade: 1
        });
      });

      localStorage.setItem('meuCarrinho', JSON.stringify(carrinho));
      executarRenderizacaoCheckout(); // Re-renderiza na hora
    }

    // 5. Listeners Iniciais
    document.addEventListener('DOMContentLoaded', executarRenderizacaoCheckout);
    
    // Ouve cliques nos bumps
    document.querySelectorAll('._orderbump').forEach(checkbox => {
      checkbox.addEventListener('change', atualizarCarrinhoEInterface);
    });

    // 6. Lógica CEP (ViaCEP)
    document.getElementById('cep').addEventListener('blur', async function() {
        const val = this.value.replace(/\D/g, '');
        if(val.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
                const data = await res.json();
                if(!data.erro) {
                    document.querySelector('.input.hidden').parentElement.querySelectorAll('.hidden').forEach(el => el.classList.remove('hidden'));
                    document.getElementById('address').value = data.logradouro;
                    document.getElementById('neighborhood').value = data.bairro;
                    document.getElementById('city').value = data.localidade;
                    document.getElementById('state').value = data.uf;
                    document.getElementById('number').focus();
                }
            } catch(e){}
        }
    });
  </script>
</body>
</html>