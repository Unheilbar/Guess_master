export function Visualizer() {
    this.audio = null
    this.volume = 0.3
    this.filler = document.getElementById('filler')
    
    // Get a canvas defined with ID "oscilloscope"
    this.canvas = document.getElementById("oscilloscope");
    this.canvasCtx = this.canvas.getContext("2d");
    
  
    this.canvas.width = 350
    this.canvas.height = 100
    
    this.WIDTH = this.canvas.width;
    this.HEIGHT = this.canvas.height+100;

  
    // draw an oscilloscope of the current audio source
    this.drawOscilloscope = audio => {
        const audioCtx = new AudioContext()
        let analyser = audioCtx.createAnalyser()
        const source = audioCtx.createMediaElementSource(audio)
        source.connect(audioCtx.destination) 
        source.connect(analyser)      
        console.log(audioCtx.getOutputTimestamp())
        analyser.fftSize = 256;
        let bufferLengthAlt = analyser.frequencyBinCount;
        let dataArrayAlt = new Uint8Array(bufferLengthAlt);
        analyser.getByteTimeDomainData(dataArrayAlt);
        console.log(dataArrayAlt)
        const startTime = Date.now()
        const drawAlt = () => {     
          let drawVisual = requestAnimationFrame(drawAlt);
          if(Date.now() - startTime > 30000) {
            cancelAnimationFrame(drawVisual)
            this.setLoadingStatus()
            return
          }
          analyser.getByteFrequencyData(dataArrayAlt);
          this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
          this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
          this.canvasCtx.clearRect(0,0, this.WIDTH, this.HEIGHT);
          let barWidth = (this.WIDTH / bufferLengthAlt);
          let barHeight;
          let x = 0;
          console.log('there')
          for(var i = 0; i < bufferLengthAlt; i++) {        
            barHeight = dataArrayAlt[i];
            this.canvasCtx.shadowBlur = barHeight*0.2;
            this.canvasCtx.shadowColor = `rgb(${69+barHeight/5},${162+barHeight/2},${158+barHeight/2})`;
            this.canvasCtx.fillStyle = `rgba(${69+barHeight/5},${162+barHeight/2},${158+barHeight/2}, ${barHeight/150})`;
            this.canvasCtx.fillRect(x,50,barWidth,barHeight/5-70/(i+1))      
            this.canvasCtx.fillRect(x,50,barWidth,-barHeight/5+70/(i+1))
            x += barWidth + 1;
          }
        }
        drawAlt()
      }
    
    this.playerAnimation = endTime => {
      const step = () => {
          let milLeft = endTime - Date.now()
          if(milLeft<50) {
            return clearInterval(timer)
          }
          let width = (30000-milLeft)/30000*100
          filler.style.width = width + '%'
      }      
      let timer = setInterval(step, 50)
    }
    
    this.setNewTrack = src => {
        let audio = new Audio()
        audio.crossOrigin = "anonymous"
        audio.src = src
        audio.play()
        audio.preload = 'auto'
        audio.volume = this.volume
        this.drawOscilloscope(audio)
        this.playerAnimation(Date.now() + 30000)  
    }
    
    this.setLoadingStatus = () => {
        this.canvasCtx.fillRect(20, 0, this.WIDTH, this.HEIGHT)
        this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        this.canvasCtx.font = '14px Exo'
        // Fill with gradient
        this.canvasCtx.fillStyle = '#66fcf1';
        this.canvasCtx.fillText("Загрузка следующего трека...", 10, 90);
        console.log('painting on canvas!!111')
    }
}
