const { id, url } = modeldiaTileOpen.getData();
localStorage.setItem(`lp-open-tile-${id}`, 'window');
openUrlIn({ url, type: 'window' });
diaTileOpen.close();