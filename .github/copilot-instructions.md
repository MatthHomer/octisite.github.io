# Copilot Instructions for Octi_Site_Novo

## Visão Geral
Este projeto é um site institucional estático para o aplicativo Octi, focado em apresentar funcionalidades, depoimentos e links para download. O código está organizado em HTML, CSS e JS, sem frameworks ou backend.

## Estrutura Principal
- `index.html`: Página principal, contém todas as seções do site (hero, features, tracking, depoimentos, download, footer).
- `assets/`: Pasta de recursos estáticos.
  - `css/`: Estilos customizados e de terceiros (Bootstrap, Animate, LineIcons).
  - `js/`: Scripts JS para animações, contadores e interações visuais.
  - `img/`, `fonts/`: Imagens e fontes usadas no site.

## Convenções e Padrões
- O site utiliza Bootstrap 5 (versão alpha) para grid e componentes básicos, mas a maior parte da customização está em `main.css`.
- Ícones são gerenciados via LineIcons (`lni` classes).
- Animações de entrada usam a biblioteca `wow.js` e classes CSS `wow fadeInUp` com delays customizados.
- Estrutura de seções é modular, cada bloco tem uma classe principal (`hero-section`, `feature-section`, etc.) e sub-blocos para conteúdo e ícones.
- Imagens e SVGs são referenciados por caminhos relativos em `assets/img/`.

## Fluxo de Desenvolvimento
- Não há build automatizado: edite arquivos diretamente e recarregue no navegador para ver mudanças.
- Para adicionar novas seções, siga o padrão de estrutura modular e classes utilitárias já presentes.
- Para customizar estilos, edite `assets/css/main.css`.
- Para adicionar scripts, utilize `assets/js/main.js`.

## Integrações e Dependências
- Não há dependências externas além dos arquivos CSS/JS já incluídos em `assets/`.
- Links externos (Google Play, sites parceiros) estão hardcoded no HTML.

## Exemplos de Padrões
- Para adicionar um novo bloco de depoimento:
  ```html
  <div class="single-testimonial wow fadeInUp" data-wow-delay=".8s">
    <div class="rating mb-15">
      <i class="lni lni-star-filled"></i>
      <!-- ... -->
    </div>
    <div class="content">
      <p>"Texto do depoimento."</p>
    </div>
    <div class="info">
      <!-- ... -->
    </div>
  </div>
  ```
- Para adicionar um novo recurso na seção de usuários/prestadores, siga o padrão de `single-feature`.

## Observações
- Não há testes automatizados, rotinas de build ou deploy documentadas.
- O site é estático e pode ser hospedado em qualquer serviço de arquivos estáticos (ex: GitHub Pages).

---

Se alguma seção estiver incompleta ou pouco clara, por favor, informe para que eu possa detalhar ou corrigir.