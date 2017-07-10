const addListener = () => {};

export default function getBrowser() {
  return {
    runtime: {
      connect: () => ({
        onMessage: { addListener }
      })
    }
  };
}
