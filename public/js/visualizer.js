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
    this.drawOscilloscope = (startTime, audio) => {
        const audioCtx = new AudioContext()
        let analyser = audioCtx.createAnalyser()
        const source = audioCtx.createMediaElementSource(audio)
        source.connect(audioCtx.destination) 
        source.connect(analyser)      
        analyser.fftSize = 256;
        let bufferLengthAlt = analyser.frequencyBinCount;
        let dataArrayAlt = new Uint8Array(bufferLengthAlt);
        analyser.getByteTimeDomainData(dataArrayAlt);
        const drawAlt = () => {     
          let drawVisual = requestAnimationFrame(drawAlt);
          if(Date.now() - startTime > 30000) {
            audio.volume = 0
            cancelAnimationFrame(drawVisual)
            this.setLoadingStatus()
            return
          }
          analyser.getByteFrequencyData(dataArrayAlt)
          this.canvasCtx.fillStyle = 'rgb(0, 0, 0)'
          this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT)
          this.canvasCtx.clearRect(0,0, this.WIDTH, this.HEIGHT)
          let barWidth = (this.WIDTH / bufferLengthAlt)
          let barHeight
          let x = 0
          for(var i = 0; i < bufferLengthAlt; i++) {        
            barHeight = dataArrayAlt[i]
            this.canvasCtx.shadowBlur = barHeight*0.1
            this.canvasCtx.shadowColor = `rgb(${69+barHeight/5},${162+barHeight/2},${158+barHeight/2})`
            this.canvasCtx.fillStyle = `rgba(${69+barHeight/5},${162+barHeight/2},${158+barHeight/2}, ${barHeight/150})`
            this.canvasCtx.fillRect(x,50,barWidth,barHeight/5-70/(i+1))      
            this.canvasCtx.fillRect(x,50,barWidth,-barHeight/5+70/(i+1))
            this.canvasCtx.fillRect(x+1,50,barWidth,-barHeight/5+70/(i+1)) 
            //this.canvasCtx.fillRect(0, 50, this.WIDTH, 2)
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
        this.drawOscilloscope(Date.now(), audio)
        this.playerAnimation(Date.now() + 30000, false)  
    }
    
    this.setLoadingStatus = () => {
      const startTime = Date.now()
      
      this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT)
      
      const radius = this.HEIGHT/4-30

      this.canvasCtx.shadowBlur = 24
      this.canvasCtx.shadowColor = 'rgb(44, 152, 185)'
      this.canvasCtx.shadowOffsetX = -8
      this.canvasCtx.lineWidth = 4
      let innerDegreesStart = 0
      let innerDegreesEnd = 360
      let gradientRedStart = 69
      let gradientGreenStart = 162
      let gradientBlueStart = 158
      let gradientRedEnd = 102
      let gradientGreenEnd = 252
      let gradientBlueEnd = 241
      let alpha = 0
      const step = () => {
        let stepframe = requestAnimationFrame(step)
        console.log('hi')
        if(Date.now() - startTime > 4000) {
          console.log('why dont you stop retard')
          cancelAnimationFrame(stepframe)
          return
        }
        let a = radius*Math.cos(Math.PI*alpha/180)
        let b = radius*Math.sin(Math.PI*alpha/180)
        let c = radius*Math.cos(Math.PI*(alpha+180)/180)
        let d = radius*Math.sin(Math.PI*(alpha+180)/180) 
        this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT)
        this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT)
        const gradient = this.canvasCtx.createLinearGradient(this.WIDTH/2+a, this.HEIGHT/4+b, this.WIDTH/2+c, this.HEIGHT/4+d)
        alpha+=3
        gradient.addColorStop(0, `rgba(${gradientRedStart}, ${gradientGreenStart}, ${gradientBlueStart}, 0)`)
        gradient.addColorStop(1, `rgba(${gradientRedEnd}, ${gradientGreenEnd}, ${gradientBlueEnd}, 1)`)
        this.canvasCtx.strokeStyle = gradient        
        const innerStartAngle = Math.PI*innerDegreesStart/180
        const innerEndAngle = Math.PI*innerDegreesEnd/180
        this.canvasCtx.beginPath()
        this.canvasCtx.arc(this.WIDTH/2, this.HEIGHT/4, radius, innerStartAngle , innerEndAngle )
        this.canvasCtx.stroke()
      }
      
      step()
    }
}
