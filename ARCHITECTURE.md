# Arquitetura

## Incremento V0.2

A UI existente agora usa `generateFace` (`geometry/face.ts`), retornando `FaceAssembly`. `head.ts` e `export.ts` preservam o gerador/exportador V0.1. `faceScene.ts` monta a mesma hierarquia/material para viewport e `exportFace.ts`, mantendo os dois caminhos coerentes. `geometry/deform.ts` contém apenas sondas limitadas de deformação; `intersections.ts` fornece a verificação transversal sem depender do renderizador. Seletores de câmera foram adicionados ao viewport existente. Nenhuma infraestrutura de aplicação foi recriada.

`src/geometry` é o núcleo puro em TypeScript, sem dependência do renderizador. O contrato `ProceduralMesh` contém posições/normais Float32, índices Uint32, UV Float32 e regiões Uint16 por vértice. Unidades: metros; +Y vertical, rosto em +Z. A geração é determinística e não acessa rede.

`store.ts` usa Zustand para parâmetros e visualização. `main.tsx` coordena geração memorizada, validação e interface React. `Viewport.tsx` converte buffers, gerencia câmera orbital, ResizeObserver e recursos GPU com descarte explícito. Alterações de material não regeneram a malha. `export.ts` adapta buffers a Three.js e GLTFExporter.

Sem half-edge ou WASM nesta resolução: complexidade adicional ainda não justificada por medições. A geração é síncrona; uma futura carga maior requer worker antes de migrar o núcleo. A interface usa CSS próprio, sem adicionar Tailwind nesta base pequena.

Contratos para colaboração com Antigravity: o integrador pode modificar viewport, UI e adaptadores; o núcleo mantém a interface tipada. Coordenar tarefas e branches antes de editar arquivos compartilhados. Nenhuma integração automática com Antigravity foi presumida ou executada.
