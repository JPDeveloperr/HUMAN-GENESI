A V0.1 gerava uma cabeça elipsoidal sem aberturas e componentes ópticos. Esta evolução mantém a aplicação e os doze parâmetros, acrescentando perfil craniano/mandibular com pescoço, loops orbitais/labiais, cavidades geométricas de boca/narinas e olhos independentes com materiais PBR. O gerador e as asserções V0.1 foram preservados.

Validação: build TypeScript/Vite, 61 testes unitários e 2 testes Chromium aprovados. Inclui limites paramétricos, interseções transversais da pele, sondas limitadas de deformação e reimportação GLB das sete malhas. Capturas reais frontal/lateral/três quartos, GLB e métricas em docs/v02; comparação, lista de arquivos e limitações em docs/V02_REPORT.md.

Ainda experimental: transições angulares nos patches, orelhas rudimentares, UV planar e ausência de rig/piscada completa. O detector não certifica contatos coplanares/tangentes nem colisões entre componentes; não há alegação de fotorrealismo ou prontidão para animação.

O remoto continha apenas o README inicial; o primeiro commit preserva separadamente a base V0.1 que existia sem commits no snapshot publicado. Os commits seguintes separam núcleo, integração e evidências V0.2. Sem merge ou deploy automático.
