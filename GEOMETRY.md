# Geometria

## Incremento V0.2

O algoritmo V0.1 descrito abaixo foi preservado. `generateFace` acrescenta perfis cúbicos monotônicos, pescoço integrado e remalhamento local por anéis. Os perímetros são escolhidos por dimensões físicas; aberturas têm paredes e tampas internas recuadas, com bordas soldadas à pele. Os olhos usam os mesmos marcos das órbitas. Normais V0.2 são ponderadas por ângulo. UV V0.2 é planar e experimental. A migração mantém parâmetros, não índices de vértices. Equações, limitações e métricas: [relatório V0.2](docs/V02_REPORT.md).

### Algoritmo V0.1 preservado

Amostragem de uma superfície cranial paramétrica: θ ∈ (0,π), φ ∈ [0,2π). Base elipsoidal com x = 0,083 w r cosφ, y = 0,125 cosθ, z = 0,090 l r sinφ. r = sin(θ), elevado a 0,78 na metade inferior para ampliar a mandíbula. Campos gaussianos G(t,c,s)=exp(-((t-c)/s)²) definem órbitas, ponte nasal, lábios, queixo e maçãs. Uma máscara max(0,sinφ)^6 limita os campos ao rosto. Parâmetros são adimensionais entre 0,7 e 1,3.

Uma única grade de anéis com índices periódicos une a costura longitudinal. Dois polos únicos fecham a superfície. São 96 amostras angulares e 72 divisões verticais: 6.818 vértices e 13.632 triângulos. Normais são somas de produtos vetoriais das faces, normalizadas. Regiões são classificações heurísticas por vértice, preservadas nos extras glTF.

UV esférico inicial: u=φ/(2π), v=1-θ/π. A costura compartilha vértices para permitir testes topológicos diretos; interpolações UV nas faces da costura atravessam o mapa. Não usar texturas detalhadas antes de implementar uma costura UV com correspondência de vértices e parametrização facial adequada.

Comparação: superfície paramétrica mantém índices estáveis e é simples de testar para o primeiro estudo. SDF/isossuperfícies facilitariam uniões de pescoço/corpo, mas não fornecem automaticamente loops de animação. Método híbrido com remalhamento permanece candidato para fases posteriores. Nenhum destes métodos garante anatomia por si só.

A validação confere finitude, dimensões, índices, área dos triângulos, normais unitárias/coerência com faces, incidência e orientação de arestas, componentes, característica de Euler e volume assinado. Não confundir variedade fechada com ausência de autointerseções: falta um teste BVH de pares de triângulos não adjacentes.
