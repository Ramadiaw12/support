class compteBanc:
    """Représenter un compte bancaire simple"""
    taux_interet = 0.5
    def __init__(self, titulaire: str, solde: float = 0.0):
        self.titulaire = titulaire
        self.solde = solde
        self._historique = []
    def deposer(self, montant: float):
        if montant <= 0:
            raise ValueError("Le motant doit être positif !")
        self.solde += montant
        self._historique.append(("depôt", montant))

    def retirer(self, montant: float) -> None:
        if montant  > self.solde:
            raise ValueError("Solde insufisant.")
        self.solde -= montant
        self._historique.append(("retrait", montant))

    def __repr__(self) -> str:
        return f"CompteBanc(titulaire={self.titulaire}, solde={self.solde})"

compte = compteBanc("Rahma", 300000)
compte.deposer(50000)
compte.retirer(150000)
print(compte)