import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../firebase/productService";

export default function HomeScreen({ navigation, route }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [barcode, setBarcode] = useState("");
  const [products, setProducts] = useState([]);
  const [editingProductId, setEditingProductId] = useState(null);

  async function loadProducts() {
    try {
      const productList = await getProducts();
      setProducts(productList);
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (route.params?.formData) {
      setName(route.params.formData.name || "");
      setPrice(route.params.formData.price || "");
      setEditingProductId(route.params.formData.editingProductId || null);
    }

    if (route.params?.scannedBarcode) {
      setBarcode(String(route.params.scannedBarcode));
    } else if (route.params?.formData?.barcode) {
      setBarcode(String(route.params.formData.barcode));
    }
  }, [route.params]);

  function formatPriceToBRL(value) {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      return "";
    }

    const priceNumber = Number(numericValue) / 100;

    return priceNumber.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function handleChangePrice(value) {
    setPrice(formatPriceToBRL(value));
  }

  function clearForm() {
    setName("");
    setPrice("");
    setBarcode("");
    setEditingProductId(null);
  }

  async function handleSaveProduct() {
    if (!name.trim() || !price.trim()) {
      Alert.alert("Atenção", "Preencha nome e preço do produto.");
      return;
    }

    const productData = {
      name: name.trim(),
      price: price.trim(),
      barcode: barcode ? String(barcode).trim() : "",
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, productData);
        Alert.alert("Sucesso", "Produto atualizado com sucesso!");
      } else {
        await createProduct(productData);
        Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
      }

      clearForm();
      await loadProducts();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    }
  }

  function handleEditProduct(product) {
    setName(product.name || "");
    setPrice(product.price || "");
    setBarcode(product.barcode || "");
    setEditingProductId(product.id);
  }

  function handleCancelEdit() {
    clearForm();
  }

  async function confirmDeleteProduct(productId) {
    try {
      await deleteProduct(productId);

      if (editingProductId === productId) {
        clearForm();
      }

      Alert.alert("Sucesso", "Produto excluído com sucesso!");
      await loadProducts();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    }
  }

  function handleDeleteProduct(productId) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja excluir este produto?"
      );

      if (confirmed) {
        confirmDeleteProduct(productId);
      }

      return;
    }

    Alert.alert(
      "Excluir produto",
      "Tem certeza que deseja excluir este produto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => confirmDeleteProduct(productId),
        },
      ]
    );
  }

  function handleOpenScanner() {
    navigation.navigate("BarcodeScanner", {
      formData: {
        name,
        price,
        barcode,
        editingProductId,
      },
    });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 24, marginTop: 40, marginBottom: 20 }}>
          Bem-vindo!
        </Text>

        <View style={{ marginBottom: 20 }}>
          <Button title="Ler código de barras" onPress={handleOpenScanner} />
        </View>

        <TextInput
          placeholder="Nome do produto"
          value={name}
          onChangeText={setName}
          autoCorrect={false}
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <TextInput
          placeholder="Preço"
          value={price}
          onChangeText={handleChangePrice}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            marginBottom: 10,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <TextInput
          placeholder="Código de barras"
          value={barcode}
          onChangeText={setBarcode}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            marginBottom: 20,
            padding: 10,
            borderRadius: 5,
          }}
        />

        <Button
          title={editingProductId ? "Atualizar produto" : "Cadastrar produto"}
          onPress={handleSaveProduct}
        />

        {editingProductId && (
          <View style={{ marginTop: 10 }}>
            <Button title="Cancelar edição" onPress={handleCancelEdit} />
          </View>
        )}

        <Text style={{ fontSize: 20, marginTop: 30, marginBottom: 10 }}>
          Produtos cadastrados
        </Text>

        {products.length === 0 ? (
          <Text>Nenhum produto cadastrado.</Text>
        ) : (
          products.map((item) => (
            <View
              key={item.id}
              style={{
                borderWidth: 1,
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
              }}
            >
              <Text>Nome: {item.name}</Text>
              <Text>Preço: {item.price}</Text>
              <Text>Código de barras: {item.barcode || "Não informado"}</Text>

              <View style={{ marginTop: 10 }}>
                <Button title="Editar" onPress={() => handleEditProduct(item)} />
              </View>

              <View style={{ marginTop: 10 }}>
                <Button
                  title="Excluir"
                  onPress={() => handleDeleteProduct(item.id)}
                />
              </View>
            </View>
          ))
        )}

        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Button title="Sair" onPress={() => navigation.navigate("Login")} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}