# HUMAN GENESIS V0.2

Laboratório local de geração de geometria humana por código. Evolução da aplicação existente: editor React/TypeScript strict, viewport Three.js/WebGL2, cabeça paramétrica com olhos independentes, loops faciais, cavidades nasais/bucal e exportação GLB da montagem completa.

## Executar

Requer Node.js 24 (validado em 24.19.0), npm 11 e navegador WebGL2. Sem backend, chaves de API, modelos externos ou serviços de geração.

```sh
npm ci
npm run dev -- --port 5173 --strictPort
```

No ambiente na nuvem, o servidor é validado internamente; a interface de onboarding não fornece prévia web.

```sh
npm run build
npm test
npm run test:e2e
```

O E2E usa Chromium em `/usr/bin/chromium`, já disponível nesta máquina. Em outro sistema, ajuste `executablePath` em `playwright.config.ts` para o navegador instalado. O teste usa SwiftShader para WebGL2 headless; não constitui benchmark de GPU.

## Recursos disponíveis

- Pele conectada e fechada com transição para pescoço, gerada sem modelos prontos.
- Globos oculares, íris e pupilas procedurais com materiais independentes.
- Loops orbitais/labiais e cavidades geométricas de boca e narinas.
- Vistas frontal, lateral e três quartos; validação de interseções transversais nas amostras de teste.
- Doze controles que modificam posições dos vértices; reset de parâmetros.
- Câmera orbital, zoom, pan; visualização sólida e wireframe.
- Cor, rugosidade e exposição funcionais.
- Contagem de vértices/triângulos, tempo de geração, intervalo de quadro e memória dos buffers CPU.
- GLB com posições, índices, normais, UV, material e regiões anatômicas nos extras; parâmetros em JSON.
- Testes de topologia e reimportação GLB no navegador.

## Evidências e limites

[Comparação V0.1 × V0.2](docs/V02_REPORT.md) · [Frontal](docs/v02/frontal.png) · [Lateral](docs/v02/lateral.png) · [Três quartos](docs/v02/three-quarter.png) · [GLB completo](docs/v02/head.glb).

O resultado é experimental e artificial, com transições angulares ainda visíveis. Não é uma malha pronta para animação. Orelhas detalhadas, rig, piscada completa, corpo e realismo continuam pendentes. A busca de interseções não certifica sobreposições coplanares ou colisões entre componentes. O gerador V0.1 e seus testes permanecem preservados.

[Arquitetura](ARCHITECTURE.md) · [Geometria](GEOMETRY.md) · [Anatomia](ANATOMY.md) · [Renderização](RENDERING.md) · [Testes](TESTING.md) · [Plano](ROADMAP.md).
