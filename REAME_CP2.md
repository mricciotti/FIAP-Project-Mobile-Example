# INTEGRANTES
```
Fernanda Rocha Menon- RM554673
Luiza Macena Dantas-RM556237
Luan Ramos Garcia de Souza – RM 558537
Matheus Ricciotti – RM 556930
Matheus Bortolotto – RM 555189
```

# Documento de Melhorias Implementadas no Projeto Mobile

## 1. Melhorias implementadas

### Melhoria 1: Formatação do campo `price` no padrão brasileiro

O campo de preço foi ajustado para seguir o padrão brasileiro de moeda. Antes, o usuário podia digitar o valor livremente, sem padronização. Agora, ao digitar os números, o campo é formatado automaticamente como moeda brasileira, utilizando `R$`, vírgula como separador decimal e ponto como separador de milhar.

Exemplos de formato esperado:

```text
R$ 10,50
R$ 199,90
R$ 1.250,00
```

**Arquivo alterado:**

```text
src/screens/HomeScreen.js
```

**Trecho do código implementado/alterado:**

```javascript
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
```

```javascript
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
```

**Principais ajustes realizados:**

* Aplicação de formatação automática no campo de preço.
* Uso do padrão brasileiro de moeda.
* Exibição do preço já formatado na listagem dos produtos.
* Tratamento do valor digitado para manter apenas números antes da formatação.

---

### Melhoria 2: Teclado dificultando a utilização do app em telas pequenas

Em telas menores, o teclado virtual estava atrapalhando o preenchimento dos campos do formulário. Além disso, durante os testes, foi identificado que o teclado fechava ao digitar nos campos de nome, preço e código de barras.

Para corrigir esse comportamento, a estrutura da tela foi ajustada. O formulário deixou de ficar dentro do `ListHeaderComponent` da `FlatList`, pois essa abordagem fazia os campos perderem o foco durante a digitação. A tela passou a utilizar `KeyboardAvoidingView` junto com `ScrollView`, melhorando o comportamento com o teclado aberto.

**Arquivo alterado:**

```text
src/screens/HomeScreen.js
```

**Trecho do código implementado/alterado:**

```javascript
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
```

```javascript
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
      {/* conteúdo da tela */}
    </ScrollView>
  </KeyboardAvoidingView>
);
```

**Principais ajustes realizados:**

* Inclusão do `KeyboardAvoidingView`.
* Inclusão do `ScrollView`.
* Remoção do formulário de dentro do `ListHeaderComponent` da `FlatList`.
* Correção do problema em que o teclado fechava ao digitar nos campos.
* Melhoria da usabilidade em telas pequenas.

---

### Melhoria 3: Preservar dados do produto ao voltar do leitor de código de barras

Foi implementado o envio dos dados já preenchidos no formulário antes de abrir o leitor de código de barras. Dessa forma, ao retornar para a tela principal, o aplicativo mantém o nome, o preço, o código de barras e o estado de edição do produto.

Essa melhoria evita que o usuário perca as informações já digitadas ao utilizar a câmera para ler o código de barras.

**Arquivos alterados:**

```text
src/screens/HomeScreen.js
src/screens/BarcodeScannerScreen.js
```

**Trecho do código implementad/alterado em ********************************************************************************`HomeScreen.js`********************************************************************************:**

```javascript
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
```

```javascript
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
```

**Trecho do código implementado/alterado em ********************************************************************************`BarcodeScannerScreen.js`********************************************************************************:**

```javascript
const formData = route.params?.formData || {};

function handleBarcodeScanned({ data }) {
  if (scanned) return;

  setScanned(true);

  Alert.alert("Código lido", data, [
    {
      text: "OK",
      onPress: () => {
        navigation.navigate("Home", {
          scannedBarcode: data,
          formData,
        });
      },
    },
  ]);
}
```

**Principais ajustes realizados:**

* Envio dos dados atuais do formulário ao abrir o leitor.
* Retorno do código de barras junto com os dados já preenchidos.
* Preservação do nome, preço, código de barras e modo de edição.
* Melhoria do fluxo de cadastro de produtos.

---

### Melhoria 4: Ajuste da rolagem do app em telas pequenas

A rolagem da tela Home foi ajustada para melhorar o uso do aplicativo em dispositivos com telas pequenas. Antes, parte do conteúdo poderia ficar difícil de acessar, principalmente quando havia produtos cadastrados ou quando o teclado estava aberto.

Com o uso do `ScrollView`, todo o conteúdo da tela pode ser acessado por rolagem, incluindo formulário, botões e lista de produtos cadastrados.

**Arquivo alterado:**

```text
src/screens/HomeScreen.js
```

**Trecho do código implementado/alterado:**

```javascript
<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{
    padding: 20,
    paddingBottom: 40,
  }}
  keyboardShouldPersistTaps="handled"
>
  {/* formulário, botões e lista de produtos */}
</ScrollView>
```

**Trecho da listagem de produtos ajustada:**

```javascript
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
```

**Principais ajustes realizados:**

* Substituição da estrutura com `FlatList` por `ScrollView`.
* Melhoria da rolagem em telas pequenas.
* Organização do formulário, botões e lista dentro da mesma área rolável.
* Inclusão de espaçamento inferior com `paddingBottom`.

##
