<template>
  <div class="card mb-4">
    <div class="card-body">
      <h5 class="card-title">{{ product?.id ? 'Edit Produk' : 'Tambah Produk' }}</h5>
      <form @submit.prevent="submitForm">
        <div class="mb-3">
          <label class="form-label">Nama Produk</label>
          <input v-model="form.name" type="text" class="form-control" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Deskripsi</label>
          <textarea v-model="form.description" class="form-control"></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Harga</label>
          <input v-model.number="form.price" type="number" class="form-control" min="0" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Stok</label>
          <input v-model.number="form.stock" type="number" class="form-control" min="0" required />
        </div>

        <button type="submit" class="btn btn-success me-2">
          {{ product?.id ? 'Update' : 'Simpan' }}
        </button>
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Batal</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, toRefs, watch } from 'vue';
import { createProduct, updateProduct } from '../api.js';

const props = defineProps({
  product: Object,
});

const emit = defineEmits(['saved', 'cancel']);

const form = reactive({
  name: '',
  description: '',
  price: 0,
  stock: 0,
});

watch(
  () => props.product,
  (newVal) => {
    if (newVal) {
      form.name = newVal.name || '';
      form.description = newVal.description || '';
      form.price = newVal.price || 0;
      form.stock = newVal.stock || 0;
    } else {
      form.name = '';
      form.description = '';
      form.price = 0;
      form.stock = 0;
    }
  },
  { immediate: true }
);

async function submitForm() {
  try {
    if (props.product && props.product.id) {
      await updateProduct(props.product.id, form);
      alert('Produk berhasil diupdate');
    } else {
      await createProduct(form);
      alert('Produk berhasil ditambahkan');
    }
    emit('saved');
  } catch (error) {
    alert('Gagal menyimpan produk: ' + error.message);
  }
}
</script>
