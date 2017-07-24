import { h } from 'hyperapp';

class Countdown {
  static PI_BY_180 = Math.PI / 180;
  static THREE_PI_BY_TWO = 3 * Math.PI / 2;
  static DEFAULT_VALUE = 360;
  static TIMER_INTERVAL = 40;

  private context? = null;
  private intervalId;
  private width;
  private height;
  private centerX;
  private centerY;
  private radius;
  public onFinish: Function = () => {};

  private update(currentValue) {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.width, this.height);

    // Draw outer track ring
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY);
    ctx.arc(
      this.centerX,
      this.centerY,
      this.radius,
      Countdown.THREE_PI_BY_TWO - (360 - currentValue) * Countdown.PI_BY_180,
      Countdown.THREE_PI_BY_TWO,
      true // counter-clockwise
    );
    ctx.closePath();
    ctx.fillStyle = '#008000';
    ctx.fill();
  }

  setCanvas(canvas) {
    const { width, height } = canvas.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.centerX = width / 2;
    this.centerY = height / 2;
    this.radius = Math.min(width, height) / 2;
    this.context = canvas.getContext('2d');
  }

  start(durationInSeconds) {
    if (!this.context) {
      throw new Error(
        'Canvas element was not provided. Did you called setCanvas?'
      );
    }

    const startTime = Date.now();
    const endTime = startTime + durationInSeconds * 1000;

    this.update(Countdown.DEFAULT_VALUE);
    this.intervalId = setInterval(() => {
      console.log('tick');
      const now = Date.now();
      if (now > endTime) {
        this.stop();
        this.update(Countdown.DEFAULT_VALUE);
        return this.onFinish();
      }

      const elapsedTime = (now - startTime) / 1000;
      const currentValue =
        Countdown.DEFAULT_VALUE *
        Math.max(0, durationInSeconds - elapsedTime) /
        durationInSeconds;
      this.update(currentValue);
    }, Countdown.TIMER_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// inspired by: http://www.northfieldx.co.uk/pietimer/

const CountdownComponent = props => {
  const { top, left, width, height, duration, onFinish } = props;
  const style = {
    position: 'absolute' as 'absolute',
    top: `${top}px`,
    left: `${left + width - height}px`
  };
  let countdown = new Countdown();
  return (
    <canvas
      key="countdownCanvas"
      oninsert={element => {
        countdown.setCanvas(element);
        countdown.onFinish = () => {
          onFinish();
        };
        countdown.start(duration);
      }}
      onremove={() => {
        console.log('removing canvas will stop countdown');
        countdown.stop();
      }}
      style={style}
      height={height}
      width={height}
    />
  );
};

export default CountdownComponent;
