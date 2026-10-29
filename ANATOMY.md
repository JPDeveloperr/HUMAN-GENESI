# Anatomia e limites

## Incremento V0.2

Implementados crânio/mandíbula com perfis separados, pescoço, olhos independentes, bordas palpebrais, ponte/dorso/ponta/asas nasais, cavidades de narinas e boca, anéis labiais e arco central. A aparência continua artificial, com transições angulares nos patches. As sondas de deformação são parciais, sem prova de prontidão para animação. Orelhas detalhadas, septo completo, dentes/língua, rig e validação antropométrica permanecem no roadmap. [Comparação e limitações V0.2](docs/V02_REPORT.md).

### Avaliação histórica V0.1

A cabeça inicial é um estudo de superfície, sem pretensão clínica ou antropométrica. Crânio, testa, bochechas, mandíbula, queixo, nariz, depressões orbitais e volumes labiais/auriculares são deformações integradas na mesma malha; não há peças humanas importadas.

Os doze parâmetros modificam regiões reais da superfície, dentro de intervalos limitados. Essa restrição e os testes não provam ausência de autointerseções ou plausibilidade em toda combinação contínua.

As capturas mostram uma silhueta humana simplificada, mas sobrancelhas, órbitas e nariz continuam suaves e artificiais. Causas: campos gaussianos amplos, ausência de globos oculares/pálpebras, nariz sem asas/narinas, lábios sem cavidade oral, orelhas sem hélice e mandíbula sem referências antropométricas.

Melhorias concretas: definir marcos anatômicos e cortes sagitais/coronais; separar ponte, ponta e asas nasais; construir loops orbitais e labiais; gerar olhos paramétricos; modelar pinna e junção do pescoço; comparar perfis frontais/laterais antes de adicionar detalhe. A topologia atual concentra arestas nos polos e não acompanha músculos ou linhas de expressão.
