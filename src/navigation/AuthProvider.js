import React, {createContext} from 'react';
import auth from '@react-native-firebase/auth';
import {useState} from 'react/cjs/react.development';
import firestore from '@react-native-firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [errorCadastro, setErrorCadastro] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uuid, setUuid] = useState(null);

  function verificaErro(mensagem) {
    if (mensagem.match(/wrong-password/)) {
      setError('*Senha incorreta.');
    } else if (mensagem.match(/user-not-found/)) {
      setError('*Usuário não encontrado.');
    } else if (mensagem.match(/email-already-in-use/)) {
      setError('*Email já cadastrado. Informe outro..');
      setErrorCadastro('*Email já cadastrado. Informe outro..');
    } else if (mensagem.match(/weak-password/)) {
      setError(
        '*Senha muito fraca. Informe uma senha com 6 ou mais caractéres.',
      );
      setErrorCadastro(
        '*Senha muito fraca. Informe uma senha com 6 ou mais caractéres.',
      );
    } else if (mensagem.match(/invalid-email/)) {
      setError('*E-mail inválido.');
      setErrorCadastro('*E-mail inválido.');
    } else {
      setError('*Algum erro ocorreu, tente mais tarde.');
      setErrorCadastro('*Algum erro ocorreu, tente mais tarde.');
    }
    setLoading(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        error,
        errorCadastro,
        loading,
        login: async (email, senha) => {
          try {
            setLoading(true);
            await auth()
              .signInWithEmailAndPassword(email, senha)
              .then(res => {
                setLoading(true);
              });
            console.log('Usuário logado com sucesso!');
            setError(null);
          } catch (e) {
            console.log(e.message);
            verificaErro(e.message);
          }
        },
        register: async (email, senha, usuario) => {
          try {
            setLoading(true);
            await auth()
              .createUserWithEmailAndPassword(email, senha)
              .then(res => {
                const {
                  user: {uid},
                } = res;
                firestore().collection('usuario').doc(uid).set({
                  nome: usuario.nome,
                  email: email,
                  telefone: usuario.telefone,
                  tpUsuario: usuario.tpUsuario,
                  genero: usuario.genero,
                });
              });
            console.log('Usuário cadastrado com sucesso!');
            setErrorCadastro(null);
          } catch (e) {
            console.log(e.message);
            verificaErro(e.message);
          }
        },
        logout: async () => {
          try {
            console.log('Deslogando...');
            setLoading(false);
            await auth().signOut();
            setError(null);
          } catch (e) {
            console.log(e.message);
            setError(e.message);
          }
        },
      }}>
      {children}
    </AuthContext.Provider>
  );
};
