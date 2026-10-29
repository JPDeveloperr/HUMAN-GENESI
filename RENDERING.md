# Renderização

Three.js usa WebGL2, material MeshStandardMaterial, hemisfério e duas luzes direcionais, tone mapping ACES e cor/rugosidade/exposição editáveis. O grid é referência espacial. OrbitControls oferece rotação, zoom e pan. O pixel ratio é limitado a 2.

Não há SSS, refração de córnea, poros, cabelo, sombras projetadas ou simulação rigorosa de pele. A cor uniforme não constitui pele realista. GLB preserva material e escala; iluminação do estúdio não integra o arquivo.

Intervalo de quadro mede tempo entre callbacks requestAnimationFrame, incluindo agendamento; não é tempo GPU. Memória exibida soma buffers tipados da malha, sem contar objetos JS, GPU e render targets. O tempo de geração exclui validação e upload GPU. Valores variam por hardware.
