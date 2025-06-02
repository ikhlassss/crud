<template>
  <div class="container mt-4">
    <h2>Daftar Produk</h2>

    <button class="btn btn-primary mb-3" @click="showForm = true; editProduct = null">
      Tambah Produk
    </button>

    <product-form
      v-if="showForm"
      :product="editProduct"
      @saved="handleSaved"
      @cancel="showForm = false"
    />

    <table class="table table-striped" v-if="products.length > 0">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Deskripsi</th>
          <th>Harga</th>
          <th>Stok</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p.id">
          <td>{{ p.name }}</td>
          <td>{{ p.description }}</td>
          <td>Rp {{ p.price.toLocaleString() }}</td>
          <td>{{ p.stock }}</td>
          <td>
            <button class="btn btn-sm btn-warning me-2" @click="edit(p)">Edit</button>
            <button class="btn btn-sm btn-danger" @click="remove(p.id)">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="alert alert-info">Belum ada produk</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ProductForm from './ProductForm.vue';
import { getProducts, deleteProduct } from '../api.js';

const products = ref([]);
const showForm = ref(false);
const editProduct = ref(null);

async function loadProducts() {
  try {
    const res = await getProducts();
    products.value = res.data;
  } catch (error) {
    alert('Gagal load produk: ' + error.message);
  }
}

function edit(product) {
  editProduct.value = { ...product }; // copy object supaya tidak langsung berubah
  showForm.value = true;
}

async function remove(id) {
  if (confirm('Yakin ingin hapus produk ini?')) {
    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      alert('Gagal hapus produk: ' + error.message);
    }
  }
}

function handleSaved() {
  showForm.value = false;
  loadProducts();
}

onMounted(() => {
  loadProducts();
});
</script>
