# Testes

## Validação V0.2

`npm test` executa 61 testes: os 28 V0.1 e 33 adicionais de geometria, posições faciais, limites individuais/conjuntos, combinações reproduzíveis, interseções transversais e deformações limitadas. O detector tem um fixture de triângulos cruzados. Contatos coplanares/tangentes e colisões entre peças não são certificados.

`npm run test:e2e` executa dois fluxos. O original conserva suas asserções e grava evidências temporárias em `test-results/`. O novo grava quatro capturas reais e o GLB em `docs/v02/`, testa as três câmeras e reimporta as sete malhas, verificando índices e buffers, cores, materiais, parâmetros de versão e loops. Os arquivos em `docs/head*` preservam a evidência V0.1.

### Suíte original V0.1

`npm run build` executa TypeScript strict e bundle Vite. `npm test` executa 28 testes Vitest: determinismo, contagens, fechamento, conectividade, Euler=2, volume positivo, ausência de degenerações, cada parâmetro nos dois limites, trinta combinações pseudoaleatórias reproduzíveis e entradas corrompidas. A amostragem não prova segurança para todo o domínio.

`npm run test:e2e` inicia o Vite e Chromium headless local. Confere canvas WebGL2 sem alerta, controle nasal e reset, modo wireframe, download GLB e reimportação com GLTFLoader: contagens de posições/índices/normais/UV/regiões e fidelidade das coordenadas. Captura sólido e wireframe em `docs/`; guarda GLB de exemplo. Teste não usa imagens externas.

Playwright cria resultados temporários ignorados por Git. As capturas e o GLB em docs são evidências versionáveis geradas pela execução; repetir E2E as atualiza. Não executar a suíte apenas para instalar o ambiente se for necessário preservar capturas locais do usuário.

Pendentes: autointerseção, qualidade antropométrica, compatibilidade com outros importadores glTF, qualidade de deformações e desempenho em GPU física. Não há testes de rig/corpo porque não foram implementados.
