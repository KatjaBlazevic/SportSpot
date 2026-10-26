import { useState } from "react";
import type { ReactNode } from "react";

import type { Korisnik } from "../../context/AuthContextDef";
import { useAuth } from "../../context/useAuth";
import useProfileCommonData from "../../hooks/useProfileCommonData";

import ProfileHeader from "./ProfileHeader";
import ProfileContent from "./ProfileContent";
import ProfileReservations from "./ProfileReservations";
import ProfileFavorites from "./ProfileFavorites";
import ProfileOwnerFacilities from "./ProfileOwnerFacilities";
import OwnerFacilityModal from "./OwnerFacilityModal";
import useProfileOwnerFacilities from "../../hooks/useProfileOwnerFacilities";
import useProfileOwnerStatistics from "../../hooks/useProfileOwnerStatistics";
import ProfileOwnerStatistics from "./ProfileOwnerStatistics";
import useProfileAdminDashboard from "../../hooks/useProfileAdminDashboard";
import ProfileAdminDashboard from "./ProfileAdminDashboard";
import useProfileAdminUsers from "../../hooks/useProfileAdminUsers";
import ProfileAdminUsers from "./ProfileAdminUsers";
import AdminUserModal from "./AdminUserModal";
import useProfileAdminFacilities from "../../hooks/useProfileAdminFacilities";
import useProfileAdminTerms from "../../hooks/useProfileAdminTerms";
import useProfileAdminClubs from "../../hooks/useProfileAdminClubs";
import ProfileAdminClubs from "./ProfileAdminClubs";
import AdminClubModal from "./AdminClubModal";
import ProfileAdminFacilities from "./ProfileAdminFacilities";
import AdminFacilityModal from "./AdminFacilityModal";
import AdminTermsModal from "./AdminTermsModal";
import useProfileAdminReviews from "../../hooks/useProfileAdminReviews";
import ProfileAdminReviews from "./ProfileAdminReviews";
import EditProfileModal from "./EditProfileModal";

import type { ProfileEditData } from "./EditProfileModal";

import { defaultProfileTab, type ProfileTab } from "./profileConfig";

interface ProfileLayoutProps {
  korisnik: Korisnik;
  additionalContent?: Partial<Record<ProfileTab, ReactNode>>;
}

const API = "http://localhost:5000/api";

export default function ProfileLayout({
  korisnik,
  additionalContent = {},
}: ProfileLayoutProps) {
  const { token, osvjezi } = useAuth();

  // Aktivni tab
  const [aktivnaTab, setAktivnaTab] = useState<ProfileTab>(
    () => defaultProfileTab[korisnik.uloga],
  );

  // Zajednički podaci
  const { omiljeni, rezervacije, ucitavanjeRez, greskaRez, ukloniOmiljeni } =
    useProfileCommonData(token, aktivnaTab);
  // Vlasnički objekti i funkcije
  const ownerFacilities = useProfileOwnerFacilities(
    token,
    aktivnaTab,
    korisnik.uloga === "Vlasnik",
  );
  // Vlasnička statistika
  const ownerStatistics = useProfileOwnerStatistics(
    token,
    aktivnaTab,
    korisnik.uloga === "Vlasnik",
  );
  // Administratorski dashboard
  const adminDashboard = useProfileAdminDashboard(
    token,
    aktivnaTab,
    korisnik.uloga === "Admin",
  );
  // Administratorsko upravljanje korisnicima
  const adminUsers = useProfileAdminUsers(
    token,
    aktivnaTab,
    korisnik.uloga === "Admin",
  );

  // Administratorsko upravljanje objektima
  const adminFacilities = useProfileAdminFacilities(
    token,
    aktivnaTab,
    korisnik.uloga === "Admin",
  );

  // Administratorsko upravljanje terminima
  const adminTerms = useProfileAdminTerms(token, korisnik.uloga === "Admin");

  // Administratorsko upravljanje klubovima
  const adminClubs = useProfileAdminClubs(
    token,
    aktivnaTab,
    korisnik.uloga === "Admin",
  );

  // Administratorsko upravljanje recenzijama
  const adminReviews = useProfileAdminReviews(
    token,
    aktivnaTab,
    korisnik.uloga === "Admin",
  );

  // Uređivanje profila
  const [showEditModal, setShowEditModal] = useState(false);
  const [spremanje, setSpremanje] = useState(false);
  const [poruka, setPoruka] = useState("");

  const [editData, setEditData] = useState<ProfileEditData>({
    ime: "",
    prezime: "",
    email: "",
    brojMobitela: "",
    novaLozinka: "",
    potvrdaLozinke: "",
  });

  // Otvaranje modala i dohvaćanje postojećih podataka
  const otvoriModal = async () => {
    const pocetniPodaci: ProfileEditData = {
      ime: korisnik.ime,
      prezime: korisnik.prezime,
      email: korisnik.email,
      brojMobitela: "",
      novaLozinka: "",
      potvrdaLozinke: "",
    };

    setEditData(pocetniPodaci);
    setPoruka("");
    setShowEditModal(true);

    if (!token) return;

    try {
      const response = await fetch(`${API}/korisnik/profil`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Dohvaćanje profila nije uspjelo.");
      }

      const data = await response.json();

      setEditData({
        ime: data.ime ?? korisnik.ime,
        prezime: data.prezime ?? korisnik.prezime,
        email: data.email ?? korisnik.email,
        brojMobitela: data.brojMobitela ?? "",
        novaLozinka: "",
        potvrdaLozinke: "",
      });
    } catch {
      setPoruka(
        "Nije moguće dohvatiti sve podatke profila. Provjeri podatke prije spremanja.",
      );
    }
  };

  // Zatvaranje modala
  const zatvoriModal = () => {
    if (spremanje) return;

    setShowEditModal(false);
    setPoruka("");
  };

  // Spremanje promjena na backend
  const spremiPromjene = async () => {
    if (!token) {
      setPoruka("Za uređivanje profila potrebna je prijava.");
      return;
    }

    if (
      editData.novaLozinka &&
      editData.novaLozinka !== editData.potvrdaLozinke
    ) {
      setPoruka("Lozinke se ne podudaraju.");
      return;
    }

    setSpremanje(true);
    setPoruka("");

    try {
      const response = await fetch(`${API}/korisnik/profil/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ime: editData.ime,
          prezime: editData.prezime,
          email: editData.email,
          brojMobitela: editData.brojMobitela || null,
          novaLozinka: editData.novaLozinka || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPoruka(data.greska || "Greška pri spremanju.");
        return;
      }

      // Ažuriranje podataka u AuthContextu
      osvjezi({
        ...korisnik,
        ime: editData.ime,
        prezime: editData.prezime,
        email: editData.email,
      });

      setShowEditModal(false);
      setPoruka("");
    } catch {
      setPoruka("Greška pri povezivanju sa serverom.");
    } finally {
      setSpremanje(false);
    }
  };

  // Komponente aktivnih tabova
  const content: Partial<Record<ProfileTab, ReactNode>> = {
    rezervacije: (
      <ProfileReservations
        rezervacije={rezervacije}
        ucitavanje={ucitavanjeRez}
        greska={greskaRez}
      />
    ),

    omiljeni: (
      <ProfileFavorites omiljeni={omiljeni} onRemove={ukloniOmiljeni} />
    ),

    mojiObjekti:
      korisnik.uloga === "Vlasnik" ? (
        <ProfileOwnerFacilities
          objekti={ownerFacilities.objekti}
          ucitavanje={ownerFacilities.ucitavanje}
          greska={ownerFacilities.greska}
          onAdd={ownerFacilities.otvoriDodajObjekt}
          onEdit={ownerFacilities.otvoriUrediObjekt}
          onDelete={ownerFacilities.zatraziObrisiObjekt}
        />
      ) : null,

    statistika:
      korisnik.uloga === "Vlasnik" ? (
        <ProfileOwnerStatistics
          statistika={ownerStatistics.statistika}
          ucitavanje={ownerStatistics.ucitavanje}
          greska={ownerStatistics.greska}
          ukupnoRezervacija={ownerStatistics.ukupnoRezervacija}
          ukupniPrihod={ownerStatistics.ukupniPrihod}
          ukupnoTermina={ownerStatistics.ukupnoTermina}
          popunjenost={ownerStatistics.popunjenost}
          maxRezervacija={ownerStatistics.maxRezervacija}
        />
      ) : null,
    dashboard:
      korisnik.uloga === "Admin" ? (
        <ProfileAdminDashboard
          dashboard={adminDashboard.dashboard}
          dashboardExtra={adminDashboard.dashboardExtra}
          ucitavanje={adminDashboard.ucitavanje}
          greska={adminDashboard.greska}
        />
      ) : null,

    korisnici:
      korisnik.uloga === "Admin" ? (
        <ProfileAdminUsers
          korisnici={adminUsers.korisnici}
          trenutniKorisnikId={korisnik.id}
          ucitavanje={adminUsers.ucitavanje}
          greska={adminUsers.greska}
          akcijaId={adminUsers.akcijaId}
          onAdd={adminUsers.otvoriKorisnikModal}
          onRoleChange={adminUsers.promijeniUlogu}
          onDelete={adminUsers.obrisiKorisnika}
        />
      ) : null,

    objekti:
      korisnik.uloga === "Admin" ? (
        <ProfileAdminFacilities
          objekti={adminFacilities.objekti}
          ucitavanje={adminFacilities.ucitavanje}
          greska={adminFacilities.greska}
          akcijaId={adminFacilities.akcijaId}
          onAdd={adminFacilities.otvoriDodajObjekt}
          onEdit={adminFacilities.otvoriUrediObjekt}
          onDelete={adminFacilities.obrisiObjekt}
          onApprove={adminFacilities.odobriObjekt}
          onConfirmDelete={adminFacilities.potvrdiObrisiObjekt}
          onRejectDelete={adminFacilities.odbijObrisiObjekt}
          onManageTerms={adminTerms.otvoriTermine}
        />
      ) : null,

    klubovi:
      korisnik.uloga === "Admin" ? (
        <ProfileAdminClubs
          klubovi={adminClubs.klubovi}
          ucitavanje={adminClubs.ucitavanje}
          greska={adminClubs.greska}
          brisanjeId={adminClubs.brisanjeId}
          onAdd={adminClubs.otvoriDodajKlub}
          onEdit={adminClubs.otvoriUrediKlub}
          onDelete={adminClubs.obrisiKlub}
        />
      ) : null,

    recenzije:
      korisnik.uloga === "Admin" ? (
        <ProfileAdminReviews
          recenzije={adminReviews.recenzije}
          ucitavanje={adminReviews.ucitavanje}
          greska={adminReviews.greska}
          brisanjeId={adminReviews.brisanjeId}
          onDelete={adminReviews.obrisiRecenziju}
        />
      ) : null,

    ...additionalContent,
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background-accent px-3 py-4 sm:px-6 sm:py-6">
      <main
        className={`mx-auto w-full ${
          korisnik.uloga === "User" ? "max-w-[900px]" : "max-w-[1100px]"
        }`}
      >
        <ProfileHeader korisnik={korisnik} onEdit={otvoriModal} />

        <ProfileContent
          uloga={korisnik.uloga}
          aktivnaTab={aktivnaTab}
          onTabChange={setAktivnaTab}
          content={content}
        />
      </main>

      <EditProfileModal
        isOpen={showEditModal}
        data={editData}
        spremanje={spremanje}
        poruka={poruka}
        onChange={setEditData}
        onClose={zatvoriModal}
        onSave={spremiPromjene}
      />
      {korisnik.uloga === "Vlasnik" && (
        <OwnerFacilityModal
          isOpen={ownerFacilities.showObjektModal}
          mode={ownerFacilities.objektMod}
          data={ownerFacilities.objektData}
          sports={ownerFacilities.sviSportovi}
          neighborhoods={ownerFacilities.sviKvartovi}
          selectedSports={ownerFacilities.odabraniSportovi}
          saving={ownerFacilities.objektSpremanje}
          message={ownerFacilities.objektPoruka}
          onChange={ownerFacilities.setObjektData}
          onSportToggle={ownerFacilities.handleSportToggle}
          onClose={ownerFacilities.zatvoriObjektModal}
          onSave={ownerFacilities.spremiObjekt}
        />
      )}
      {korisnik.uloga === "Admin" && (
        <AdminUserModal
          isOpen={adminUsers.showKorisnikModal}
          data={adminUsers.noviKorisnik}
          saving={adminUsers.spremanje}
          message={adminUsers.poruka}
          onChange={adminUsers.setNoviKorisnik}
          onClose={adminUsers.zatvoriKorisnikModal}
          onSave={adminUsers.spremiKorisnika}
        />
      )}

      {korisnik.uloga === "Admin" && (
        <AdminFacilityModal
          isOpen={adminFacilities.showObjektModal}
          mode={adminFacilities.objektMod}
          data={adminFacilities.objektData}
          owners={adminFacilities.sviVlasnici}
          clubs={adminFacilities.klubovi}
          sports={adminFacilities.sviSportovi}
          neighborhoods={adminFacilities.sviKvartovi}
          selectedSports={adminFacilities.odabraniSportovi}
          isNewNeighborhood={adminFacilities.noviKvartAdmin}
          saving={adminFacilities.objektSpremanje}
          message={adminFacilities.objektPoruka}
          onChange={adminFacilities.setObjektData}
          onSportToggle={adminFacilities.handleSportToggle}
          onNeighborhoodToggle={adminFacilities.handleNoviKvartToggle}
          onClose={adminFacilities.zatvoriObjektModal}
          onSave={adminFacilities.spremiObjekt}
        />
      )}

      {korisnik.uloga === "Admin" && (
        <AdminTermsModal
          isOpen={adminTerms.showTerminiModal}
          facilityName={adminTerms.terminiObjektNaziv}
          terms={adminTerms.termini}
          loading={adminTerms.ucitavanje}
          error={adminTerms.greska}
          message={adminTerms.poruka}
          showForm={adminTerms.showDodajTermin}
          editTerm={adminTerms.editTermin}
          data={adminTerms.terminData}
          saving={adminTerms.spremanje}
          deletingId={adminTerms.brisanjeId}
          onChange={adminTerms.setTerminData}
          onAdd={adminTerms.otvoriDodajTermin}
          onEdit={adminTerms.otvoriUrediTermin}
          onDelete={adminTerms.obrisiTermin}
          onSave={adminTerms.spremiTermin}
          onCancelForm={adminTerms.zatvoriTerminFormu}
          onClose={adminTerms.zatvoriTermine}
        />
      )}

      {korisnik.uloga === "Admin" && (
        <AdminClubModal
          isOpen={adminClubs.showKlubModal}
          mode={adminClubs.klubMod}
          data={adminClubs.klubData}
          saving={adminClubs.spremanje}
          message={adminClubs.klubPoruka}
          onChange={adminClubs.setKlubData}
          onClose={adminClubs.zatvoriKlubModal}
          onSave={adminClubs.spremiKlub}
        />
      )}
    </div>
  );
}
