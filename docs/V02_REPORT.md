# HUMAN GENESIS V0.2 — reconstrução facial experimental

## Resultado e escopo

A aplicação existente foi evoluída, mantendo React, Zustand, Three.js, controles, câmera orbital, wireframe, JSON de parâmetros e exportação GLB. O gerador V0.1 e seus testes permanecem disponíveis. A V0.2 introduz pele conectada com pescoço, olhos independentes, loops orbitais/labiais, narinas e boca com cavidades geométricas. Não utiliza modelos humanos externos, imagens como geometria ou serviços remotos de geração.

O resultado ainda é estilizado e artificial. A V0.2 não representa aprovação anatômica, fotorrealismo ou malha pronta para animação. O detalhamento de orelhas foi mantido no roadmap para priorizar crânio, olhos, nariz e boca, conforme o escopo permitido.

## Inspeção e plano incremental

Antes da implementação foram lidos o núcleo, adaptadores, viewport, documentação técnica, testes unitários e E2E. A V0.1 amostrava um elipsoide deformado por gaussianas, com costura soldada e polos únicos. Os campos não geravam aberturas, loops faciais ou cavidades. O queixo convergia para um polo inferior; UV, distribuição de arestas e fluxo não eram adequados a expressões.

O Git remoto continha apenas o README inicial. Os arquivos da aplicação V0.1 existiam no snapshot publicado, ainda sem commit. Foram preservados num commit de base separado na branch `feature/human-genesis-v0.2`, sem apagar trabalho existente. O diff para main inclui essa base necessária e os incrementos V0.2.

Plano executado:

1. Preservar a base e os 28 testes V0.1.
2. Adicionar um gerador V0.2 independente do renderizador, mantendo o contrato de parâmetros.
3. Remalhar patches locais em anéis conectados, abrir cavidades e gerar componentes ópticos.
4. Validar limites, continuidade, normais, interseções transversais e deformações limitadas.
5. Integrar materiais, exportação da montagem, vistas repetíveis e documentação comparativa.

## Comparação verificável

| Aspecto | V0.1 | V0.2 |
| --- | --- | --- |
| Perfil craniano | Elipsoide com campos locais | Perfis cúbicos monotônicos com polos arredondados |
| Mandíbula | Convergência para polo pontudo | Perfil de mandíbula/queixo e transição para pescoço |
| Olhos | Depressões na superfície | Globos, íris e pupilas independentes; aberturas com bordas palpebrais |
| Nariz | Protuberância gaussiana | Ponte, dorso, ponta, asas e duas cavidades nasais inclinadas |
| Boca | Relevos labiais | Anéis labiais, arco central e abertura com câmara interna |
| Topologia facial | Grade cranial uniforme | Substituição de patches por oito anéis de suporte e paredes internas |
| Normais | Ponderação por área | Ponderação angular no núcleo V0.2 |
| Material | Cor uniforme | PBR, variação cromática matemática discreta e materiais ópticos separados |
| Pele padrão | 6.818 vértices / 13.632 triângulos | 26.272 vértices / 52.540 triângulos |
| Montagem completa | Uma malha | Pele + seis componentes ópticos fechados |
| Regressão unitária | 28 testes | 61 testes, incluindo os 28 originais |
| Navegador | Um fluxo | Dois fluxos, incluindo montagem GLB e três vistas |

As contagens V0.2 podem mudar com os parâmetros: o remalhamento escolhe o perímetro dos patches por extensão física. Mais polígonos não comprovam anatomia. A resolução atual é conservadora para cavidades pequenas; simplificação adaptativa continua pendente. Dados completos, incluindo bytes e cinco medições de geração, estão em [metrics.json](v02/metrics.json). As medições Node e Chromium/SwiftShader não são benchmark de uma GPU física.

## Algoritmos e contratos

`generateHead` continua reproduzindo a V0.1. `generateFace` retorna `FaceAssembly`: pele, componentes independentes, parâmetros, marcos oculares e índices dos loops. Os doze nomes e intervalos [0,7; 1,3] são mantidos. A semântica continua relativa, com acoplamentos anatômicos limitados para evitar separação excessiva de olhos.

A pele usa coordenadas em metros, +Y vertical e face em +Z. A largura e profundidade são interpoladas com curvas cúbicas que preservam a forma; os intervalos nos polos usam raiz quadrada com tangente compatível. Gaussianas separadas representam ponte, dorso, ponta e asas nasais, volumes zigomáticos e queixo. Os olhos derivam dos mesmos marcos usados para abrir as órbitas; o envelope ocular controla a superfície palpebral.

Patches retangulares da grade frontal são removidos e substituídos por anéis que convergem para contornos orbitais, labiais e nasais. A seleção por dimensões físicas, em vez de número fixo de colunas, evita inversões em cabeças estreitas. Os perímetros compartilham índices com a pele; não são peças coladas. Cada abertura tem paredes e uma tampa interna recuada: a superfície permanece uma variedade fechada, apesar da abertura visível para a cavidade. Boca e narinas não são manchas escuras sobre uma malha fechada externamente.

Normais ponderadas por ângulo evitam que grandes triângulos de transição dominem os pequenos triângulos das cavidades. A validação original não foi enfraquecida. A geometria óptica é paramétrica, com malhas fechadas e materiais independentes; não há refração rigorosa da córnea.

## Migração

JSONs V0.1 com os doze parâmetros podem ser passados diretamente a `generateFace`. Não há promessa de correspondência entre índices V0.1/V0.2, nem entre remalhamentos com parâmetros diferentes. Regerar a montagem a partir dos parâmetros; nunca reaplicar offsets de vértice antigos sem projeção espacial. O GLB V0.2 contém versão, parâmetros, unidades e loops nos extras, além de regiões por vértice. Não há animação glTF exportada.

## Testes executados

- Build TypeScript strict + Vite. Mantido aviso de bundle acima de 500 KB; não é falha de compilação.
- 61 testes unitários: os 28 originais, validade dos componentes, efeito real de cada parâmetro, limites individuais, doze combinações pseudoaleatórias reproduzíveis e todos os parâmetros nos limites conjuntos.
- Pele e cada componente óptico: índices válidos, normais unitárias e coerentes, ausência de degenerações, orientação de arestas, variedade fechada, uma componente e Euler=2.
- Busca espacial em grade + interseção segmento/triângulo: nenhuma interseção transversal não adjacente detectada na pele padrão, nos limites conjuntos ou nas quatro sondas de deformação. Um fixture propositalmente cruzado comprova que o detector encontra interseções.
- Sondas de deformação: fechamento parcial superior até 0,5 e abertura labial limitada, com os mesmos índices, normais recalculadas e teste de cruzamentos. Não equivalem a piscada completa ou rig mandibular.
- Dois testes Playwright no Chromium: regressão do editor, edição/reset, wireframe, download; reimportação de todas as sete malhas V0.2, igualdade de índices, posições/normais/UV com tolerância de 1e-7, material, cores, versão e loops preservados.
- Capturas reais: frontal, lateral, três quartos e wireframe; GLB baixado pelo botão real da aplicação.

## Evidências

| V0.1 preservada | V0.2 |
| --- | --- |
| [Sólido](head-solid.png) | [Frontal](v02/frontal.png) |
| [Wireframe](head-wireframe.png) | [Lateral](v02/lateral.png) |
| [GLB](head.glb) | [Três quartos](v02/three-quarter.png) |
| — | [Wireframe](v02/wireframe.png) · [GLB completo](v02/head.glb) |

As vistas V0.2 usam os parâmetros padrão. O exemplo GLB V0.1 preservado usa projeção nasal 1,22, como documentado no relatório anterior; não comparar arquivos como se fossem o mesmo preset. Os testes antigos agora gravam suas evidências temporárias em test-results para não sobrescrever os arquivos históricos.

## Limitações restantes

- As transições dos patches orbitais/labiais ainda deixam volumes angulares visíveis nas capturas; exigem melhor continuidade de curvatura e distribuição de arestas. A aparência permanece artificial.
- O modelo não foi ajustado a dados antropométricos ou validado por especialista em anatomia. Têmporas, bochechas e linha mandibular ainda são aproximações.
- Narinas são cavidades cegas simplificadas; não há septo interno completo, vias nasais ou dentes/língua na boca.
- Orelhas continuam como volumes integrados rudimentares. Hélice, anti-hélice, concha, trago e lóbulo detalhados estão pendentes.
- Loops experimentais não são topologia muscular validada. Faltam piscada completa, colisões de pálpebras, rig, skinning, expressões e articulação mandibular real.
- O teste de autointerseção só detecta cruzamentos transversais entre triângulos não adjacentes da mesma pele. Não certifica contatos tangentes, sobreposições coplanares ou colisões entre olhos e paredes internas. O encaixe das peças ópticas é uma aproximação em camadas.
- Os UVs V0.2 são projeção planar inicial, com sobreposição no lado posterior; não constituem atlas para texturas humanas. São preservados pelo exportador e cobertos pelo roundtrip.
- Geração/validação continuam síncronas na thread principal, com centenas de milissegundos nesta máquina. Worker e remalhamento adaptativo de menor custo são próximos passos; nenhum FPS fixo é prometido.
- Não há SSS, pele fotorrealista, cabelo, corpo ou animação completa. Não foram utilizadas texturas humanas prontas.

## Arquivos do incremento V0.2

- Núcleo: `src/geometry/face.ts`, `deform.ts`, `intersections.ts`, `face.test.ts`; `validate.ts` expõe contadores adicionais, preservando as verificações originais.
- Integração: `src/faceScene.ts`, `src/exportFace.ts`, `src/Viewport.tsx`, `src/main.tsx`, `src/style.css`.
- Testes: `tests/face.spec.ts`; `tests/editor.spec.ts` mantém asserções e muda apenas destinos de evidências temporárias.
- Versão: `package.json`, `package-lock.json`.
- Documentação: README, ARCHITECTURE, GEOMETRY, ANATOMY, RENDERING, TESTING, ROADMAP, este relatório e artefatos em `docs/v02/`.

O primeiro commit da branch inclui separadamente os arquivos da base V0.1, pois não estavam presentes no histórico Git remoto. Nenhum merge ou deploy foi realizado.
