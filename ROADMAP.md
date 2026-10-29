# Plano

V0.1 permanece como gerador e regressão histórica. A V0.2 evolui a aplicação com crânio/mandíbula/pescoço, olhos independentes, aberturas geométricas e loops orbitais/labiais. [Relatório V0.2](docs/V02_REPORT.md).

Prioridade seguinte, antes do corpo:

1. Melhorar continuidade de curvatura nas bordas dos patches orbitais/labiais, hoje visualmente angulares; avaliar frontal, lateral e três quartos com referências antropométricas.
2. Distribuição adaptativa de polígonos e processamento em worker, preservando o contrato de parâmetros.
3. Pálpebras com piscada completa, controle de colisões entre peças, mandíbula articulada e testes de expressões. Os probes atuais são limitados e não constituem rig.
4. Asas/septo nasal e cavidade oral mais anatômicos; dentes e língua procedurais.
5. Orelhas procedurais detalhadas: hélice, anti-hélice, concha, trago e lóbulo. A V0.2 conserva apenas volumes auriculares simplificados.
6. Atlas UV sem sobreposição e melhorias de pele PBR, com limites físicos explicitados.

Corpo completo, rig corporal, caminhada, cabelo, realismo e produto integrado continuam pendentes. Não avançar ao corpo antes de revisar a cabeça. Não importar malhas humanas ou substituir geometria por imagens. Não inferir anatomia correta a partir da contagem de polígonos.
