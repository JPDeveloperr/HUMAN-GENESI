# HUMAN GENESIS

Laboratório local de geração de geometria humana por código. Implementação inicial das Fases 0 e 1: editor React/TypeScript strict, viewport Three.js/WebGL2, cabeça contínua paramétrica, validação estrutural e exportação GLB.

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

- Cabeça gerada sem modelos prontos, em uma superfície conectada e fechada.
- Doze controles que modificam posições dos vértices; reset de parâmetros.
- Câmera orbital, zoom, pan; visualização sólida e wireframe.
- Cor, rugosidade e exposição funcionais.
- Contagem de vértices/triângulos, tempo de geração, intervalo de quadro e memória dos buffers CPU.
- GLB com posições, índices, normais, UV, material e regiões anatômicas nos extras; parâmetros em JSON.
- Testes de topologia e reimportação GLB no navegador.

## Evidências e limites

[Relatório técnico](docs/REPORT.md) · [Captura sólida](docs/head-solid.png) · [Wireframe](docs/head-wireframe.png) · [GLB de exemplo](docs/head.glb).

Esta é uma aproximação anatômica inicial, ainda artificial. Não há olhos separados, pálpebras, cavidade oral, pescoço, rig, corpo, animação ou pele realista. Não é uma malha pronta para animação. Validação estrutural não detecta autointerseções. As fases posteriores permanecem pendentes; primeiro é necessária avaliação da cabeça.

[Arquitetura](ARCHITECTURE.md) · [Geometria](GEOMETRY.md) · [Anatomia](ANATOMY.md) · [Renderização](RENDERING.md) · [Testes](TESTING.md) · [Plano](ROADMAP.md).
