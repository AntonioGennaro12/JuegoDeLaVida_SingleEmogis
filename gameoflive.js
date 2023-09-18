const EMO_PLAYERS   = ["🧒", "👩🏾‍🦱", "👱‍♀️", "👩🏽‍🦱", "👧", "👱", "👵🏼", "🧓"];
const EMO_OTHERS1   = ["👿", "😖", "🤬", "😠", "😡", "👹", "👺"];
const EMO_OTHERS2   = ["🧛", "🦇", "☠️", "🧟", "🕷️", "💀"];
const EMO_DEATH     = "⚰️";
const EMO_BARRIER   = "🚧";
// Clase Celula
class Celula {
  #x;
  #y;
  #estado;
  #siguienteEstado;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;
    this.#estado = Math.random() < 0.5 ? 0 : 1; // Inicializa aleatoriamente como viva o muerta
    this.#siguienteEstado = 0; // Estado que tendrá en la siguiente generación
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get estado() {
    return this.#estado;
  }

  set estado(nuevoEstado) {
    this.#estado = nuevoEstado;
  }

  get siguienteEstado() {
    return this.#siguienteEstado;
  }

  set siguienteEstado(nuevoEstado) {
    this.#siguienteEstado = nuevoEstado;
  }

  // Método para calcular el siguiente estado de la célula
  calcularSiguienteEstado(vecinosVivos) {
    if (this.#estado === 1) {
      if (vecinosVivos < 2 || vecinosVivos > 3) {
        this.#siguienteEstado = 0; // Muere por soledad o superpoblación
      } else {
        this.#siguienteEstado = 1; // Permanece viva
      }
    } else {
      if (vecinosVivos === 3) {
        this.#siguienteEstado = 1; // Nace por reproducción
      } else {
        this.#siguienteEstado = 0; // Permanece muerta
      }
    }
  }

   // Método para actualizar el estado de la célula
  actualizarEstado() {
    this.#estado = this.#siguienteEstado;
  }

  // Método para dibujar la célula en el tablero
  dibujar(contexto, lado) {
    const x = this.#x * lado;
    const y = this.#y * lado;
    contexto.fillStyle = this.#estado === 1 ? "lightgreen" : "black";
    contexto.fillRect(x, y, lado, lado);
    contexto.fillStyle = "red";
    contexto.font = lado*0.7 + "px sans-serif"; // Ajusta el tamaño de fuente aquí
    const texto = this.#estado === 1 ? EMO_PLAYERS[this.#x%EMO_PLAYERS.length] : "⚰️";
    contexto.fillText(texto, x + lado /8 , y + lado /1.5);
    //contexto.fillText = this.#estado === 1 ? "V" : "M", this.#x, this.#y;
    //contexto.strokeRect(x, y, lado, lado);
  }

}

// Clase Tablero
class Tablero {
  #filas;
  #columnas;
  #canvas;
  #context;
  #celulas;
  #lado;
  #animacionId;

  constructor(filas, columnas, canvasId) {
    this.#filas = filas;
    this.#columnas = columnas;
    this.#canvas = document.getElementById(canvasId);
    this.#context = this.#canvas.getContext("2d");
    this.#celulas = [];
    this.#lado = this.#canvas.width / this.#columnas; // Calcula el tamaño de la célula
    this.actualizarTamanioCanvas(); // Ajusta el tamaño del canvas al cargar la página

    window.addEventListener("resize", () => this.actualizarTamanioCanvas()); // Ajusta el tamaño del canvas al cambiar el tamaño de la ventana

    // Inicializar el tablero con células
    for (let y = 0; y < this.#filas; y++) {
      for (let x = 0; x < this.#columnas; x++) {
        this.#celulas.push(new Celula(x, y));
      }
    }
  }

  // Método para ajustar el tamaño del canvas al tamaño de la ventana
  actualizarTamanioCanvas() {
    const ancho = window.innerWidth * 0.9; // Ancho ligeramente menor
    const alto = window.innerHeight * 0.9; // Alto ligeramente menor
    this.#lado = Math.min(ancho / this.#columnas, alto / this.#filas); // Calcula el tamaño de la célula
    this.#canvas.width = this.#lado * this.#columnas;
    this.#canvas.height = this.#lado * this.#filas;
  }

  // Método para dibujar el tablero
  dibujarTablero() {
    for (const celula of this.#celulas) {
      celula.dibujar(this.#context, this.#lado);
    }
  }

  // Método para calcular el siguiente estado de todas las células en el tablero
  calcularSiguienteEstadoTablero() {
    for (const celula of this.#celulas) {
      const vecinosVivos = this.contarVecinosVivos(celula);
      celula.calcularSiguienteEstado(vecinosVivos);
    }
  }

  // Método para actualizar el estado de todas las células en el tablero
  actualizarEstadoTablero() {
    for (const celula of this.#celulas) {
      celula.actualizarEstado();
    }
  }

  // Método para obtener una célula en una ubicación específica
  //getCelulaEn(x, y) {
  //  return this.#celulas.find((celula) => celula.x === x && celula.y === y);
  //}

  // Método para obtener una célula en una ubicación específica
  getCelulaEn(x, y) {
    // Verificar si x está fuera del rango de columnas
    if (x >= this.#columnas) {
      x = 0; // Tomar la primera columna
    } else if (x < 0) {
      x = this.#columnas - 1; // Tomar la última columna
    }

    // Verificar si y está fuera del rango de filas
    if (y >= this.#filas) {
      y = 0; // Tomar la primera fila
    } else if (y < 0) {
      y = this.#filas - 1; // Tomar la última fila
    }

    return this.#celulas.find((celula) => celula.x === x && celula.y === y);
  }

  // Método para contar las células vecinas vivas de una célula dada
  contarVecinosVivos(celula) {
    let vecinosVivos = 0;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // No contar la propia célula
        const vecino = this.getCelulaEn(celula.x + dx, celula.y + dy);
        if (vecino && vecino.estado === 1) {
          vecinosVivos++;
        }
      }
    }
    return vecinosVivos;
  }

  // Método para actualizar el estado de todas las células en el tablero
  actualizarEstadoTablero() {
    for (const celula of this.#celulas) {
      celula.actualizarEstado();
    }
  }

  // Método para iniciar o detener la animación del juego
  toggleAnimacion() {
    if (!this.#animacionId) {
      this.#animacionId = requestAnimationFrame(this.#iterar.bind(this));
    } else {
      cancelAnimationFrame(this.#animacionId);
      this.#animacionId = null;
    }
  }

  // Método privado para realizar una iteración del juego
  #iterar() {
    this.calcularSiguienteEstadoTablero();
    this.actualizarEstadoTablero();
    this.dibujarTablero();
    this.#animacionId = requestAnimationFrame(this.#iterar.bind(this));
  }

  // Método para borrar todas las células en el tablero
  borrarTablero() {
    for (const celula of this.#celulas) {
      celula.estado = 0;
      celula.siguienteEstado = 0;
    }
  }

  // Método para generar un patrón aleatorio en el tablero
  generarPatronAleatorio() {
    for (const celula of this.#celulas) {
      celula.estado = Math.random() < 0.5 ? 0 : 1;
      celula.siguienteEstado = 0;
    }
  }

   // Método público para iniciar la animación con un retraso personalizado
   iniciarAnimacion(retraso) {
    const iterarConRetraso = () => {
      this.calcularSiguienteEstadoTablero();
      this.actualizarEstadoTablero();
      this.dibujarTablero();

      setTimeout(() => {
        this.#animacionId = requestAnimationFrame(iterarConRetraso);
      }, retraso);
    };

    if (!this.#animacionId) {
      iterarConRetraso();
    }
   }
}

// Función para inicializar y comenzar el juego
function iniciarJuego() {
  const tablero = new Tablero(20, 45, "canvas");
  tablero.iniciarAnimacion(200); // Comienza la animación con un retraso de 100 ms (10 cuadros por segundo)
}

// Iniciar el juego al cargar la página
iniciarJuego();

