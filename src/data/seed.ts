import type { Tutorial } from './types';

const NOW = '2026-11-20T00:00:00.000Z';

const APPS = {
  whatsapp: { name: 'WhatsApp', packageNames: ['com.whatsapp', 'com.whatsapp.w4b'] },
  telefone: {
    name: 'Telefone',
    packageNames: ['com.google.android.dialer', 'com.samsung.android.dialer', 'com.android.dialer'],
  },
  configuracoes: { name: 'Configurações', packageNames: ['com.android.settings'] },
  camera: {
    name: 'Câmera',
    packageNames: ['com.google.android.GoogleCamera', 'com.sec.android.app.camera', 'com.android.camera'],
  },
};

/** Tutoriais que vêm com o aplicativo. O administrador pode editar ou excluir. */
export const SEED_TUTORIALS: Tutorial[] = [
  {
    id: 'ligacao',
    title: 'Fazer uma ligação',
    description: 'Ligue para alguém usando o teclado de números do celular.',
    emoji: '📞',
    category: 'Celular',
    difficulty: 'facil',
    targetApp: APPS.telefone,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 'l1',
        title: 'O aplicativo Telefone abriu',
        instruction: 'Esta é a tela do Telefone. Procure um botão redondo com vários pontinhos, chamado "Teclado".',
      },
      {
        id: 'l2',
        title: 'Abra o teclado',
        instruction: 'Toque no botão "Teclado". Vão aparecer os números de 0 a 9.',
      },
      {
        id: 'l3',
        title: 'Digite o número',
        instruction: 'Toque nos números, um de cada vez, com calma. Se errar, toque na seta de apagar.',
        tip: 'Para ligar para outra cidade, comece com 0, o código da operadora e o DDD.',
      },
      {
        id: 'l4',
        title: 'Ligue',
        instruction: 'Toque no botão verde com o desenho de um telefone. Encoste o celular na orelha.',
      },
      {
        id: 'l5',
        title: 'Para desligar',
        instruction: 'Quando terminar a conversa, afaste o celular do rosto e toque no botão vermelho.',
      },
    ],
  },
  {
    id: 'tamanho-letra',
    title: 'Aumentar a letra do celular',
    description: 'Deixe todos os textos do celular maiores e mais fáceis de ler.',
    emoji: '🔠',
    category: 'Celular',
    difficulty: 'facil',
    targetApp: APPS.configuracoes,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 't1',
        title: 'Configurações abriu',
        instruction: 'Esta é a tela de Configurações. Arraste o dedo de baixo para cima para ver mais opções.',
      },
      {
        id: 't2',
        title: 'Procure "Tela" ou "Visor"',
        instruction: 'Encontre a opção "Tela" (em alguns celulares se chama "Visor") e toque nela.',
        tip: 'Você também pode tocar na lupa no alto da tela e escrever "fonte".',
      },
      {
        id: 't3',
        title: 'Tamanho da fonte',
        instruction: 'Toque em "Tamanho da fonte" ou "Tamanho e estilo da fonte".',
      },
      {
        id: 't4',
        title: 'Arraste para aumentar',
        instruction: 'Arraste a bolinha da barra para a direita. O texto de exemplo vai ficando maior.',
      },
      {
        id: 't5',
        title: 'Pronto!',
        instruction: 'Quando gostar do tamanho, é só voltar. A mudança é salva sozinha.',
      },
    ],
  },
  {
    id: 'whatsapp-mensagem',
    title: 'Mandar mensagem no WhatsApp',
    description: 'Escreva e envie uma mensagem para um familiar ou amigo.',
    emoji: '💬',
    category: 'Conversas',
    difficulty: 'facil',
    targetApp: APPS.whatsapp,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 'w1',
        title: 'O WhatsApp abriu',
        instruction: 'Aqui aparecem suas conversas. Cada linha é uma pessoa ou um grupo.',
      },
      {
        id: 'w2',
        title: 'Escolha a pessoa',
        instruction: 'Toque no nome da pessoa com quem quer conversar. Se não encontrar, toque na lupa e escreva o nome.',
      },
      {
        id: 'w3',
        title: 'Toque na caixa de texto',
        instruction: 'Lá embaixo há uma caixa escrita "Mensagem". Toque nela e o teclado vai aparecer.',
      },
      {
        id: 'w4',
        title: 'Escreva',
        instruction: 'Digite sua mensagem tocando nas letras. Não precisa ter pressa.',
        tip: 'Prefere falar? Segure o botão do microfone, fale e solte para enviar um áudio.',
      },
      {
        id: 'w5',
        title: 'Envie',
        instruction: 'Toque no botão verde com uma setinha, à direita da caixa de texto. Pronto, mensagem enviada!',
      },
    ],
  },
  {
    id: 'foto',
    title: 'Tirar uma foto',
    description: 'Use a câmera do celular para registrar um momento.',
    emoji: '📷',
    category: 'Celular',
    difficulty: 'facil',
    targetApp: APPS.camera,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 'f1',
        title: 'A câmera abriu',
        instruction: 'A tela agora mostra o que a câmera está vendo. Segure o celular com as duas mãos.',
      },
      {
        id: 'f2',
        title: 'Enquadre',
        instruction: 'Aponte para o que quer fotografar. Toque na tela em cima da pessoa para deixar a imagem nítida.',
      },
      {
        id: 'f3',
        title: 'Tire a foto',
        instruction: 'Toque no botão grande e redondo, embaixo, no meio da tela. Segure o celular parado.',
      },
      {
        id: 'f4',
        title: 'Veja a foto',
        instruction: 'Toque no quadradinho no canto de baixo para ver a foto que você tirou.',
      },
    ],
  },
  {
    id: 'whatsapp-video',
    title: 'Chamada de vídeo no WhatsApp',
    description: 'Converse vendo o rosto da pessoa, de graça, pela internet.',
    emoji: '🎥',
    category: 'Conversas',
    difficulty: 'medio',
    targetApp: APPS.whatsapp,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      { id: 'v1', title: 'O WhatsApp abriu', instruction: 'Encontre a conversa da pessoa e toque no nome dela.' },
      {
        id: 'v2',
        title: 'Botão da câmera',
        instruction: 'No alto da tela, ao lado do nome, toque no desenho de uma filmadora.',
      },
      {
        id: 'v3',
        title: 'Confirme',
        instruction: 'Se aparecer uma pergunta, toque em "Ligar". Aguarde a pessoa atender.',
        tip: 'Use o Wi-Fi de casa para não gastar o pacote de internet.',
      },
      {
        id: 'v4',
        title: 'Durante a chamada',
        instruction: 'Segure o celular na frente do rosto. Se a imagem sumir, toque na tela para os botões voltarem.',
      },
      { id: 'v5', title: 'Encerrar', instruction: 'Para terminar, toque no botão vermelho.' },
    ],
  },
  {
    id: 'wifi',
    title: 'Conectar no Wi-Fi',
    description: 'Ligue o celular na internet de casa para economizar dados.',
    emoji: '🛜',
    category: 'Internet',
    difficulty: 'medio',
    targetApp: APPS.configuracoes,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 'i1',
        title: 'Configurações abriu',
        instruction: 'Toque em "Conexões" ou em "Rede e internet".',
      },
      { id: 'i2', title: 'Abra o Wi-Fi', instruction: 'Toque em "Wi-Fi". Se a chave estiver desligada, toque nela para ligar.' },
      {
        id: 'i3',
        title: 'Escolha sua rede',
        instruction: 'Aparece uma lista com nomes. Toque no nome da internet da sua casa.',
        tip: 'O nome e a senha costumam estar numa etiqueta embaixo do aparelho de internet (roteador).',
      },
      {
        id: 'i4',
        title: 'Digite a senha',
        instruction: 'Digite a senha com atenção às letras maiúsculas e minúsculas. Depois toque em "Conectar".',
      },
      { id: 'i5', title: 'Conectado!', instruction: 'Quando aparecer "Conectado" embaixo do nome, está pronto.' },
    ],
  },
  {
    id: 'pix',
    title: 'Fazer um Pix com segurança',
    description: 'Envie dinheiro pelo aplicativo do seu banco, conferindo tudo antes.',
    emoji: '💸',
    category: 'Banco',
    difficulty: 'dificil',
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 'p1',
        title: 'Abra o app do seu banco',
        instruction: 'Volte para a tela inicial e toque no aplicativo do seu banco. Depois toque em "Próximo" aqui.',
        tip: 'Nunca faça um Pix porque alguém pediu por mensagem ou ligação com pressa. Desconfie!',
      },
      {
        id: 'p2',
        title: 'Entre na sua conta',
        instruction: 'Digite sua senha do aplicativo. Ninguém do banco pede essa senha por telefone.',
      },
      {
        id: 'p3',
        title: 'Encontre o Pix',
        instruction: 'Procure um botão escrito "Pix" ou o símbolo de um losango. Toque nele.',
      },
      {
        id: 'p4',
        title: 'Escolha "Pagar" ou "Transferir"',
        instruction: 'Toque em "Transferir" ou "Pagar com chave".',
      },
      {
        id: 'p5',
        title: 'Digite a chave Pix',
        instruction: 'A chave pode ser CPF, telefone, e-mail ou um código. Digite com atenção.',
      },
      {
        id: 'p6',
        title: 'Coloque o valor',
        instruction: 'Digite o valor. Confira se a vírgula está no lugar certo (R$ 50,00 e não R$ 5.000,00).',
      },
      {
        id: 'p7',
        title: 'CONFIRA O NOME',
        instruction: 'Antes de confirmar, leia o nome de quem vai receber. É mesmo a pessoa certa?',
        tip: 'Se o nome for diferente do esperado, NÃO continue. Pergunte para alguém de confiança.',
      },
      {
        id: 'p8',
        title: 'Confirme',
        instruction: 'Se estiver tudo certo, toque em "Confirmar" e digite a senha. Guarde o comprovante.',
      },
    ],
  },
  {
    id: 'golpes',
    title: 'Reconhecer mensagens de golpe',
    description: 'Aprenda os sinais de uma mensagem falsa antes de responder.',
    emoji: '🛡️',
    category: 'Segurança',
    difficulty: 'dificil',
    targetApp: APPS.whatsapp,
    createdAt: NOW,
    updatedAt: NOW,
    steps: [
      {
        id: 'g1',
        title: 'Desconfie da pressa',
        instruction: 'Golpistas sempre dizem que é urgente: "pague agora", "sua conta será bloqueada".',
      },
      {
        id: 'g2',
        title: '"Mãe, troquei de número"',
        instruction: 'Se um parente diz que trocou de número e pede dinheiro, ligue para o número ANTIGO dele para confirmar.',
      },
      {
        id: 'g3',
        title: 'Não toque em links estranhos',
        instruction: 'Não toque em links de prêmios, promoções ou "atualize seus dados".',
      },
      {
        id: 'g4',
        title: 'Nunca passe códigos',
        instruction: 'Se pedirem um código que chegou por SMS, NÃO envie. Com ele, roubam o seu WhatsApp.',
      },
      {
        id: 'g5',
        title: 'Na dúvida, pare',
        instruction: 'Não responda. Mostre a mensagem para alguém de confiança antes de fazer qualquer coisa.',
      },
    ],
  },
];
