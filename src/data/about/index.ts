import type { AboutContent } from '@/types/content';

/* ==========================================================================
   SOBRE
   Único conteúdo inicial autorizado: marca e assinatura. Os demais campos
   ficam vazios até o professor preenchê-los.

   photo:     'midia/sobre/retrato.jpg'
   name:      'Nome'
   biography: ['Parágrafo…']
   origin:    ['Parágrafo…']
   personal:  ['Parágrafo…']
   message:   ['Parágrafo…']
   memories:  [{ kind: 'image', src: 'midia/sobre/lembranca-01.jpg', caption: '…' }]
   thanks:    ['Parágrafo…']
   ========================================================================== */

export const ABOUT: AboutContent = {
  brand: 'BATTLE BOTS',
  signature: 'Um projeto feito por Lucas',
  photo: 'midia/sobre/retrato.webp',
  name: "Lucas Rafael da Silva Gomes",
  biography: [
    "Sou Lucas Rafael da Silva Gomes, formado em Mecatrônica, programador, ex-aluno e ex-professor do CETEPI, onde trabalhei durante três anos. Minha trajetória nessa instituição começou como estudante e ganhou um novo significado quando tive a oportunidade de voltar como professor, compartilhar o que havia aprendido e acompanhar outros jovens descobrindo suas próprias capacidades.",
    "Como aluno dos professores Patrick e Fernando, encontrei referências que marcaram minha formação e ajudaram a transformar uma ideia em um projeto que continua fazendo parte da minha vida. Ao meu lado, eles contribuíram para desenvolver e dar vida à Batalha de Robôs. Seus nomes fazem parte dessa história, tanto pelo conhecimento que compartilharam quanto pela disposição de acreditar em uma iniciativa que ainda estava dando seus primeiros passos.",
    "Hoje, trabalho como superintendente da Secretaria de Planejamento Estratégico da Prefeitura de Paulo Afonso. Entre os projetos que desenvolvo está o Panorama Municipal, sistema de inteligência da prefeitura criado por mim e pela minha equipe para reunir informações, facilitar análises e apoiar o planejamento e a gestão do município.",
    "Da sala de aula ao desenvolvimento de sistemas, procuro transformar conhecimento em ferramentas que possam ser utilizadas e aprimoradas por outras pessoas. Gosto de programar, construir, experimentar e ver uma ideia começar a funcionar. Foi esse interesse que me aproximou da Mecatrônica e que continua orientando meu trabalho.",
    "A Batalha de Robôs ocupa um lugar especial nessa trajetória. Ela reúne minha experiência como aluno, os anos em que fui professor e as amizades que nasceram durante esse caminho. Mais do que uma realização do meu currículo, é um projeto que desejo ver crescer pelas mãos de quem vem depois de mim."
  ],
  origin: [
    "A Batalha de Robôs nasceu em 2022, quando ainda tínhamos pouco acesso aos equipamentos e às tecnologias que hoje fazem parte do projeto. A impressão 3D não estava ao nosso alcance da mesma forma, os recursos de eletrônica eram limitados e muitas decisões dependiam de tentativa, pesquisa e improvisação. Ainda estávamos aprendendo quais motores utilizar, como alimentar os circuitos e de que maneira transformar uma estrutura simples em um robô capaz de competir.",
    "Tínhamos um sonho e vontade de colocá-lo em prática. Por isso, resolvemos arriscar. Com a participação dos professores Patrick e Fernando, meus professores e parceiros nessa construção, começamos a dar forma à ideia. Eles ajudaram a desenvolver o projeto, compartilharam conhecimentos e contribuíram para que a Batalha de Robôs saísse da imaginação e chegasse aos primeiros testes.",
    "A primeira edição foi experimental. Apenas dois robôs participaram, o Vermelhão e o Caldo Quinol, e nenhum deles funcionou como esperávamos. Houve dificuldades com motores, baterias e mecanismos, e a disputa terminou sem um vencedor definido. Ainda assim, saímos daquela experiência com algo valioso: problemas concretos para investigar e motivos para tentar novamente.",
    "Nos anos seguintes, fomos incorporando o que aprendíamos. Chegaram os projetos em CAD, os frames impressos em 3D, novas formas de controle, um uso mais adequado das baterias e armas ativas mais desenvolvidas. A competição também ganhou modalidades, como sumô e corrida de obstáculos, e passou a contar com checkpoints eletrônicos. Cada edição trouxe avanços e novas dificuldades, que se tornaram parte do aprendizado da próxima turma.",
    "O que começou com poucos recursos foi crescendo com a participação dos alunos. Eles trouxeram ideias, testaram soluções e deram personalidade aos seus robôs. É essa participação que mantém o projeto vivo.",
    "Meu desejo é que a Batalha de Robôs continue despertando curiosidade e vontade de aprender. Que cada turma receba o conhecimento da anterior, acrescente suas próprias descobertas e o compartilhe com quem chegar depois. Patrick, Fernando e eu ajudamos a iniciar essa história; sua continuidade depende das próximas gerações que escolherem fazer parte dela."
  ],
  personal: [
    "Quando olho para este projeto, lembro de muito mais do que robôs e competições. Lembro das conversas, das ideias que surgiam durante as aulas, das risadas e da expectativa de ver alguma coisa funcionar depois de várias tentativas.",
    "Eu conheci o CETEPI primeiro como aluno. Foi ali que comecei a construir parte dos conhecimentos e das relações que me acompanhariam depois. Voltar como professor me permitiu enxergar aquele espaço de outra maneira: agora eu podia ajudar outras pessoas a experimentar, fazer perguntas e descobrir caminhos que talvez ainda não imaginassem para si.",
    "Durante os três anos em que trabalhei lá, aprendi muito com meus alunos. Aprendi com suas dúvidas, com as soluções que propunham e com a maneira como cada um encarava um desafio. Também construí amizades que ultrapassaram a sala de aula e continuam tendo importância na minha vida.",
    "A Batalha de Robôs guarda um pouco de tudo isso. Em cada edição, houve trabalho, frustração, entusiasmo e aprendizado. Nem sempre conseguimos o resultado que queríamos, mas sempre encontrávamos algo que poderíamos fazer melhor na próxima tentativa.",
    "Este site é uma forma de compartilhar o que construímos e facilitar o caminho de quem quiser continuar. Espero que os materiais, os registros e as ferramentas disponíveis aqui ajudem novos alunos a começar com mais apoio do que tivemos no início.",
    "Quero que vocês possam estudar essas ideias, questioná-las e modificá-las. Que encontrem soluções melhores, acrescentem recursos e façam projetos que eu ainda não saberia imaginar. Ver alguém partir do que construímos e chegar mais longe será uma das melhores formas de reconhecer o valor dessa experiência."
  ],
  message: [
    "A todos vocês que foram meus alunos, deixo meu agradecimento por cada momento que compartilhamos.",
    "Obrigado pelas risadas, pelas conversas, pelas perguntas e pela confiança. Obrigado por embarcarem nas ideias, por insistirem nos testes e por tornarem aqueles anos tão importantes para mim. Muitos de vocês chegaram à minha vida como alunos e se tornaram amigos que quero levar comigo por toda a vida.",
    "Pelas aulas, pelas brincadeiras e pelo tempo que passamos juntos, pude viver momentos que não havia tido a chance de viver como estudante. Vocês me ajudaram a criar novas lembranças em um lugar onde eu também carregava a sensação de ter perdido muitas outras. Sou muito grato por isso.",
    "Espero ter contribuído para a formação de vocês, mas saibam que vocês também contribuíram para a minha. Ensinar exigiu que eu estudasse, repensasse ideias e aprendesse a ouvir. Conviver com vocês me trouxe amizades, alegria e razões para continuar criando.",
    "Para os caminhos que ainda vão percorrer, desejo que mantenham a coragem de tentar. Não esperem conhecer todas as respostas antes de começar. Pesquisem, peçam ajuda, testem com cuidado e procurem entender o que aconteceu quando alguma coisa não funcionar. Muitas das nossas melhores descobertas começaram assim.",
    "Este projeto e este site representam apenas 1% do que ainda podem se tornar. Existem outros 99% esperando pelas ideias, pelo estudo e pelo trabalho de vocês. Há muito para explorar: novos robôs, novas ferramentas, formas melhores de ensinar e maneiras de tornar esse conhecimento acessível a mais pessoas.",
    "Deixo essa continuidade como uma missão. Estudem o que está aqui, aprendam com os acertos e com os erros, melhorem os projetos e compartilhem o que descobrirem. Ajudem os alunos que vierem depois, assim como os professores Patrick e Fernando me ajudaram e como procurei ajudar vocês.",
    "Eu dei o pontapé inicial e comecei a andar para que vocês tenham a oportunidade de correr. Quero vê-los chegar mais longe, agora e no futuro, construindo caminhos próprios e levando outras pessoas junto.",
    "Torço por vocês, pelos seus projetos e pela vida que estão construindo. Espero que guardem boas lembranças do tempo que passamos juntos e que continuem encontrando motivos para aprender, criar e tentar mais uma vez."
  ],
  messageSignoff: ["Com carinho e gratidão,", "Lucas Rafael"],
  memories: [
    { kind: 'image', src: 'midia/sobre/lembranca-01.webp', ratio: '892/1600' },
    { kind: 'image', src: 'midia/sobre/lembranca-02.webp', ratio: '1139/1124' },
    { kind: 'image', src: 'midia/sobre/lembranca-03.webp', ratio: '739/986' },
    { kind: 'image', src: 'midia/sobre/lembranca-04.webp', ratio: '739/986' },
    { kind: 'image', src: 'midia/sobre/lembranca-05.webp', ratio: '739/986' },
    { kind: 'image', src: 'midia/sobre/lembranca-06.webp', ratio: '739/556' },
    { kind: 'image', src: 'midia/sobre/lembranca-07.webp', ratio: '739/986' },
    { kind: 'video', src: 'midia/sobre/video-01.mp4', poster: 'midia/sobre/video-01.jpg', ratio: '576/1024' },
    { kind: 'video', src: 'midia/sobre/video-02.mp4', poster: 'midia/sobre/video-02.jpg', ratio: '576/1024' },
    { kind: 'video', src: 'midia/sobre/video-03.mp4', poster: 'midia/sobre/video-03.jpg', ratio: '576/1024' },
    { kind: 'video', src: 'midia/sobre/video-04.mp4', poster: 'midia/sobre/video-04.jpg', ratio: '368/640' },
    { kind: 'video', src: 'midia/sobre/video-05.mp4', poster: 'midia/sobre/video-05.jpg', ratio: '368/640' },
    { kind: 'video', src: 'midia/sobre/video-06.mp4', poster: 'midia/sobre/video-06.jpg', ratio: '576/1024' },
    { kind: 'video', src: 'midia/sobre/video-07.mp4', poster: 'midia/sobre/video-07.jpg', ratio: '368/640' },
    { kind: 'video', src: 'midia/sobre/video-08.mp4', poster: 'midia/sobre/video-08.jpg', ratio: '576/1024' },
    { kind: 'video', src: 'midia/sobre/video-09.mp4', poster: 'midia/sobre/video-09.jpg', ratio: '352/624' },
    { kind: 'video', src: 'midia/sobre/video-10.mp4', poster: 'midia/sobre/video-10.jpg', ratio: '368/640' },
    { kind: 'video', src: 'midia/sobre/video-11.mp4', poster: 'midia/sobre/video-11.jpg', ratio: '576/1024' },
    { kind: 'video', src: 'midia/sobre/video-12.mp4', poster: 'midia/sobre/video-12.jpg', ratio: '576/1024' },
  ],
};
