const { id, url } = modeldiaTileOpen.getData();
localStorage.setItem(`lp-open-tile-${id}`, 'tab');
openUrlIn({ url, type: 'tab' });
diaTileOpen.close();