const sensorData = {
    "ckp": {
        name: "Rotação do Motor (CKP)",
        funcao: "Informa à central (ECU) a rotação do motor (RPM) e a posição exata do ponto morto superior (PMS) para centelha e injeção.",
        defeito: "O motor simplesmente não pega (não há centelha nem comando de injeção), ou o veículo morre repentinamente em movimento e só volta a funcionar quando o motor esfria (comum em falhas térmicas do sensor indutivo). Pode gerar falha de funcionamento intermitente e corte de giro.",
        voltagem: "Indutivo: CA (0,5V a 20V+). Hall: 0V a 5V (Onda Quadrada).",
        resistencia: "Tipo Indutivo: Possui uma bobina interna. Funcionamento Normal: Geralmente apresenta entre 200 a 1.000 ohms (dependendo do modelo do fabricante). Durante a partida, gera tensão alternada (AC acima de 3V)."
    },
    "cmp": {
        name: "Fase (CMP)",
        funcao: "Identifica a posição do comando de válvulas, indicando qual cilindro está no tempo de compressão (usado em injeção sequencial).",
        defeito: "Dificuldade na partida (demora mais que o normal para pegar), funcionamento irregular do motor em marcha lenta e perda de potência. O sistema de injeção perde a referência sequencial e passa a injetar combustível de forma semi-sequencial ou coletiva.",
        voltagem: "Onda digital de 0V a 5V.",
        resistencia: "Funcionamento Normal: A grande maioria atual é de Efeito Hall ou indutiva avançada. Nos modelos indutivos raros, a resistência fica na faixa de 500 a 1.500 ohms. Em modelos Hall, mede-se a queda de tensão de sinal (0V a 5V). Funcionamento Irregular: Curto interno gerando resistência nula ou interrupção total (circuito aberto)."
    },
    "ect": {
        name: "Temperatura da Água (ECT)",
        funcao: "Monitora a temperatura do líquido de arrefecimento do motor para ajuste de enriquecimento de combustível e acionamento da ventoinha.",
        defeito: "Consumo excessivo de combustível (a ECU acha que o carro está sempre frio e enriquece a mistura), falhas de marcha lenta, dificuldade na partida a frio (principalmente com álcool/flex) e risco grave de superaquecimento, pois a ventoinha do radiador pode deixar de ser acionada corretamente.",
        voltagem: "Frio (20°C): 3,0V a 3,5V | Quente (90°C): 0,4V a 0,6V.",
        resistencia: "Funcionamento Normal: É um termistor tipo NTC (a resistência diminui conforme a temperatura do motor aumenta): Motor Frio (aprox. 20°C): 2.000 a 3.000 ohms. Motor Quente (aprox. 90°C): 200 a 300 ohms. Funcionamento Irregular: Resistência travada infinitamente alta (OL - sensor em aberto) ou travada próxima de 0 ohms (curto-circuito interno, indicando leitura fictícia de superaquecimento extremo)."
    },
    "map": {
        name: "Pressão Absoluta / Coletor (MAP)",
        funcao: "Mede a pressão e o vácuo gerados no coletor de admissão, calculando a carga de ar admitida pelo motor.",
        defeito: "Motor 'pesado' e sem resposta ao acelerar, falhas e engasgos nas acelerações bruscas, marcha lenta instável (oscilando muito ou morrendo) e forte aumento no consumo de combustível devido à leitura incorreta da carga do motor.",
        voltagem: "Marcha lenta: 0,8V a 1,5V | Aceleração: 3,5V a 4,5V."
    },
    "tps": {
        name: "Posição da Borboleta (TPS)",
        funcao: "Informa o ângulo de abertura da borboleta de aceleração para a ECU gerenciar o torque e o avanço.",
        defeito: "Resposta lenta ou 'buracos' na aceleração (o motor hesita ao pisar fundo), marcha lenta acelerada ou oscilante, e em casos mais graves, o veículo entra em modo de segurança (limp mode), limitando drasticamente a rotação do motor.",
        voltagem: "Borboleta fechada: 0,4V a 0,9V | Totalmente aberta: 4,0V a 4,8V.",
        resistencia: "Funcionamento Normal: É um potenciômetro resistivo. A resistência total entre os extremos (Alimentação e Terra) costuma ser fixa, variando entre 1.000 a 5.000 ohms. A resistência do pino de sinal varia suavemente de acordo com a abertura da borboleta (ex: de 1k ohms fechada até 3,5k ohms aberta).Funcionamento Irregular: Pistas de carvão desgastadas gerando saltos repentinos de resistência, resistência infinita (OL) em trechos específicos (falhas de aceleração / 'buracos') ou trilha em curto."
    },
    "maf": {
        name: "Fluxo / Massa de Ar (MAF)",
        funcao: "Mede diretamente a massa de ar (peso e volume) que entra no motor por meio de um filamento aquecido.",
        defeito: "Marcha lenta irregular (podendo apagar ao tirar o pé), falhas na aceleração, perda significativa de potência (motor 'amarrado'), fumaça preta no escape pelo excesso de combustível e acionamento da luz de anomalia no painel.",
        voltagem: "Marcha lenta: 0,7V a 0,9V | Aceleração: 1,0V a 1,5V+."
    },
    "o2": {
        name: "Oxigênio / Sonda Lambda (O2)",
        funcao: "Analisa a quantidade de oxigênio residual nos gases de escape para corrigir a proporção ar/combustível.",
        defeito: "Aumento drástico no consumo de combustível, emissão elevada de poluentes, marcha lenta instável, falhas de combustão e perda de desempenho geral. O escapamento pode apresentar cheiro forte de combustível não queimado.",
        voltagem: "Zircônia: Oscila constantemente entre 0,1V (pobre) e 0,9V (rica)."
    },
    "ks": {
        name: "Detonação (KS)",
        funcao: "Detecta vibrações anormais no bloco (batida de pino / pré-ignição), permitindo que a ECU tarde o ponto de ignição.",
        defeito: "Como a ECU não consegue detectar a 'batida de pino' (pré-ignição), ela não consegue atrasar o ponto de ignição adequadamente. Isso gera perda de desempenho e, em casos prolongados com combustível de baixa qualidade, pode causar danos mecânicos internos graves no motor (pistões furados ou quebra de anéis).",
        voltagem: "Pequenos picos de tensão CA (milivolts - 0V a 1V+) sob vibração anormal."
    },
    "iat": {
        name: "Temperatura do Ar (IAT)",
        funcao: "Mede a temperatura do ar que entra no coletor para refinar o cálculo da densidade do oxigênio.",
        defeito: "Leve aumento no consumo de combustível e falhas sutis na dirigibilidade, já que o módulo de injeção assume um valor de segurança (padrão) para a temperatura do ar caso o sensor falhe.",
        voltagem: "Frio: 2,0V a 3,0V | Quente: 0,5V a 1,0V.",
        resistencia: "Funcionamento Normal: Assim como o ECT, é um termistor NTC:Ar Frio (aprox. 20°C): 2.000 a 3.000 ohms. Ar Quente (aprox. 80°C): 300 a 400 ohms. Funcionamento Irregular: Resistência infinita (OL - sensor aberto) ou valor estático inalterável mesmo com variação térmica externa."
    },
    "vss": {
        name: "Velocidade do Veículo (VSS)",
        funcao: "Informa a velocidade real de deslocamento do veículo para o painel e o módulo de injeção.",
        defeito: "O velocímetro do painel para de funcionar ou oscila, o odômetro deixa de contar a quilometragem, e em muitos veículos o carro tende a morrer ao descer desengatado ou ao parar em semáforos (pois a ECU perde a referência de que o carro está em movimento). Pode afetar também o funcionamento da direção eletro-hidráulica ou do câmbio automático.",
        voltagem: "Onda de pulsos quadrados de 0V a 5V ou 0V a 12V."
    },
    "app": {
        name: "Posição do Pedal do Acelerador (APP)",
        funcao: "Utilizado em veículos com acelerador eletrônico (Drive-by-Wire) para registrar a intenção de aceleração.",
        defeito: "O acelerador perde total ou parcialmente a resposta. O veículo entra imediatamente em modo de segurança, permitindo apenas uma marcha lenta acelerada para retirá-lo da via com cuidado.",
        voltagem: "P1 repouso: 0,7V / Total: 4,0V | P2 repouso: 0,3V / Total: 2,0V."
    }
};

function updateSensorInfo() {
    const select = document.getElementById("sensorSelect");
    const infoBox = document.getElementById("sensorInfo");
    const selectedKey = select.value;

    if (selectedKey && sensorData[selectedKey]) {
        const data = sensorData[selectedKey];
        document.getElementById("sensorTitle").innerText = data.name;
        document.getElementById("sensorFunction").innerText = data.funcao;
        document.getElementById("sensorDefect").innerText = data.defeito;
        document.getElementById("sensorVoltage").innerText = data.voltagem;
        document.getElementById("sensorResistencia").innerText = data.resistencia;
        infoBox.style.display = "block";
    } else {
        infoBox.style.display = "none";
    }
}