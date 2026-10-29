# Relatório técnico — 28/10/2026

## Entrega

Repositório inicialmente contendo somente README. Criados aplicação React/Vite/TypeScript strict, núcleo geométrico independente, editor Zustand, viewport Three.js, exportador GLB, testes e documentação. Não foram utilizados modelos humanos prontos, Blender ou APIs de geração. Não houve push ou integração com Antigravity.

## Validação executada

- `npm ci --no-audit --no-fund`: instalação reproduzível pelo lockfile concluída.
- `npm run build`: TypeScript e build de produção concluídos. Aviso de bundle principal de aproximadamente 744 KB minificado (202 KB gzip); code splitting permanece melhoria futura.
- `npm test`: 28 testes passaram; nenhum ignorado.
- `npm run test:e2e`: um teste de fluxo completo passou no Chromium/SwiftShader. Viewport WebGL2, edição nasal, reset, wireframe, download GLB e reimportação com GLTFLoader exercitados sem erros JS de página.
- Reimportação: posições equivalentes com tolerância de 1e-7 m; 6.818 posições/normais/UV/regiões e 40.896 índices preservados.
- Servidor Vite iniciado; requisição HTTP local retornou HTML da aplicação. Nenhuma prévia pública foi criada.
- Leitura GitHub existente validada com `git ls-remote origin HEAD`; nenhuma chave adicional foi necessária.

## Métricas da malha padrão

| Métrica | Resultado |
| --- | ---: |
| Vértices | 6.818 |
| Triângulos | 13.632 |
| Componentes conectados | 1 |
| Arestas abertas / não manifold | 0 / 0 |
| Característica de Euler | 2 |
| Volume assinado | 0,00400272 m³ |
| Buffers CPU | 395.396 bytes |

O volume descreve o envelope geométrico, não é uma estimativa clínica. Geração e intervalo de quadro são medidos na interface; nenhum FPS fixo é prometido. SwiftShader não mede desempenho de uma GPU física.

## Evidência real

[Modo sólido](head-solid.png), [wireframe após alteração nasal](head-wireframe.png) e [GLB exportado](head.glb). A captura sólida usa os parâmetros padrão. Wireframe e GLB usam `noseLength=1.22`. Capturas produzidas pelo navegador executando esta aplicação.

## Avaliação visual e limitações

Os primeiros volumes excessivos do nariz e laterais foram reduzidos após inspecionar a captura. O resultado continua artificial: órbitas sem olhos/pálpebras, orelhas rudimentares, nariz sem narinas e lábios sem cavidade oral. A distribuição de polígonos é uma grade cranial, sem loops musculares; não serve ainda como evidência de deformabilidade facial. UV tem limitação de costura longitudinal compartilhada. Autointerseções não são testadas; testes de fechamento e Euler não as excluem.

Fase 0 funcional implementada. Fase 1 é somente a primeira versão experimental e exige avaliação anatômica. Corpo, rig, animação, pele realista e demais fases não foram iniciados. Próximas ações concretas estão em ANATOMY.md e ROADMAP.md.

## Ambiente reutilizável

Node 24.19.0, npm 11, dependências instaladas e Chromium disponível na imagem. Campos `install_script` e `start_skill` salvos no rascunho: instalação via npm ci, build/testes, reinício de Vite e verificações de prontidão. Não são necessárias credenciais ou variáveis de aplicação. Proxy e verificação TLS foram mantidos.

O ambiente atual foi validado; publicação e restauração em uma tarefa nova não foram realizadas. Revisar/salvar as configurações e publicar o ambiente pela interface do produto. Os processos atuais não sobrevivem ao snapshot; as instruções salvas explicam o reinício.
