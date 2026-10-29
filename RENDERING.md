# Renderização

## Incremento V0.2

A mesma cena Three.js passa a receber sete malhas: pele e duas trincas esclera/íris/pupila. A pele tem variação cromática matemática discreta e cores por região; roughness, cor e exposição continuam editáveis. Materiais ópticos são independentes, com clearcoat aproximado. Não há córnea refrativa, SSS ou promessa de realismo. Botões de vista frontal/lateral/três quartos fornecem enquadramentos repetíveis para avaliação. O GLB exporta as malhas, os materiais e as cores, sem a iluminação do estúdio.

### Base V0.1

Three.js usa WebGL2, material MeshStandardMaterial, hemisfério e duas luzes direcionais, tone mapping ACES e cor/rugosidade/exposição editáveis. O grid é referência espacial. OrbitControls oferece rotação, zoom e pan. O pixel ratio é limitado a 2.

Não há SSS, refração de córnea, poros, cabelo, sombras projetadas ou simulação rigorosa de pele. A cor uniforme não constitui pele realista. GLB preserva material e escala; iluminação do estúdio não integra o arquivo.

Intervalo de quadro mede tempo entre callbacks requestAnimationFrame, incluindo agendamento; não é tempo GPU. Memória exibida soma buffers tipados da malha, sem contar objetos JS, GPU e render targets. O tempo de geração exclui validação e upload GPU. Valores variam por hardware.
